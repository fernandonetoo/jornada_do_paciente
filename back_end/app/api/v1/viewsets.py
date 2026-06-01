from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from app.models import (
    FrontendRecord,
    UnidadeBasicaDeSaude,
    Medico,
    HospitalTratamento,
    Paciente,
    Atendimento,
    Teleconsulta,
    RetornoTeleconsulta,
    SolicitacaoExame,
    ResultadoExame,
    Diagnostico,
    UserProfile,
)
from app.api.responses import api_response
from .serializers import (
    UnidadeSerializer,
    UserSerializer,
    MedicoSerializer,
    HospitalSerializer,
    PacienteSerializer,
    DiagnosticoSerializer,
    AtendimentoSerializer,
    TeleconsultaSerializer,
    RetornoTeleconsultaSerializer,
    SolicitacaoExameSerializer,
    ResultadoExameSerializer,
    FrontendRecordSerializer,
    UserProfileSerializer,
)
from .services import (
    COLLECTION_KEYS,
    all_collections,
    allowed_users_for,
    assigned_patient_cpfs,
    can_write_frontend_record,
    collection_items,
    create_or_update_patient_record,
    ensure_groups,
    ensure_profile,
    extract_patient_cpf,
    frontend_user,
    has_group,
    is_admin_user,
    only_digits,
    parse_date,
    records_for_user,
    replace_collection,
    split_name,
)


def allowed_patient_cpfs(user):
    if is_admin_user(user) or has_group(user, "medico_ubs"):
        return None
    if has_group(user, "paciente"):
        return [only_digits(ensure_profile(user).cpf)]
    if has_group(user, "medico_oncologista"):
        return assigned_patient_cpfs(user)
    return []


def patient_scope_filter(user, field_name):
    cpfs = allowed_patient_cpfs(user)
    if cpfs is None:
        return Q()
    return Q(**{f"{field_name}__in": cpfs})


def user_can_write_role(user, roles):
    if is_admin_user(user):
        return True
    return any(has_group(user, role) for role in roles)


class StandardResponseMixin:
    allowed_write_roles = ("admin",)

    def ensure_write_allowed(self):
        if not user_can_write_role(self.request.user, self.allowed_write_roles):
            raise PermissionDenied("Voce nao tem permissao para alterar este recurso.")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return api_response(self.get_paginated_response(serializer.data).data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return api_response(serializer.data)

    def create(self, request, *args, **kwargs):
        self.ensure_write_allowed()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(serializer.data, "Registro criado com sucesso.", status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        self.ensure_write_allowed()
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(serializer.data, "Registro atualizado com sucesso.")

    def destroy(self, request, *args, **kwargs):
        self.ensure_write_allowed()
        instance = self.get_object()
        self.perform_destroy(instance)
        return api_response(None, "Registro removido com sucesso.", status.HTTP_204_NO_CONTENT)


class UnidadeViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = UnidadeBasicaDeSaude.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)


class UserViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return allowed_users_for(self.request.user)


class UserProfileViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related("user").all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.select_related("user").filter(user__in=allowed_users_for(self.request.user))


class MedicoViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Medico.objects.select_related("user", "ubs", "crm").all()
        if is_admin_user(user) or has_group(user, "medico_ubs"):
            return queryset
        if has_group(user, "medico_oncologista"):
            return queryset.filter(user=user)
        return queryset.none()


class HospitalViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = HospitalTratamento.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)


class PacienteViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = Paciente.objects.select_related("user", "ubs").all()
        return queryset.filter(patient_scope_filter(self.request.user, "cpf"))


class AtendimentoViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = Atendimento.objects.select_related("paciente", "medico", "ubs").all()
        return queryset.filter(patient_scope_filter(self.request.user, "paciente__cpf"))


class TeleconsultaViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Teleconsulta.objects.all()
    serializer_class = TeleconsultaSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = Teleconsulta.objects.select_related("atendimento__paciente", "atendimento__medico").all()
        return queryset.filter(patient_scope_filter(self.request.user, "atendimento__paciente__cpf"))


class RetornoTeleconsultaViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = RetornoTeleconsulta.objects.all()
    serializer_class = RetornoTeleconsultaSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = RetornoTeleconsulta.objects.select_related("teleconsulta__atendimento__paciente").all()
        return queryset.filter(patient_scope_filter(self.request.user, "teleconsulta__atendimento__paciente__cpf"))


class SolicitacaoExameViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = SolicitacaoExame.objects.all()
    serializer_class = SolicitacaoExameSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = SolicitacaoExame.objects.select_related(
            "teleconsulta__atendimento__paciente",
            "retorno__teleconsulta__atendimento__paciente",
        ).all()
        cpfs = allowed_patient_cpfs(self.request.user)
        if cpfs is None:
            return queryset
        return queryset.filter(
            Q(teleconsulta__atendimento__paciente__cpf__in=cpfs)
            | Q(retorno__teleconsulta__atendimento__paciente__cpf__in=cpfs)
        )


class ResultadoExameViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = ResultadoExame.objects.all()
    serializer_class = ResultadoExameSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs",)

    def get_queryset(self):
        queryset = ResultadoExame.objects.select_related(
            "solicitacao__teleconsulta__atendimento__paciente",
            "solicitacao__retorno__teleconsulta__atendimento__paciente",
        ).all()
        cpfs = allowed_patient_cpfs(self.request.user)
        if cpfs is None:
            return queryset
        return queryset.filter(
            Q(solicitacao__teleconsulta__atendimento__paciente__cpf__in=cpfs)
            | Q(solicitacao__retorno__teleconsulta__atendimento__paciente__cpf__in=cpfs)
        )


class DiagnosticoViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Diagnostico.objects.all()
    serializer_class = DiagnosticoSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_oncologista",)

    def get_queryset(self):
        queryset = Diagnostico.objects.select_related(
            "retorno__teleconsulta__atendimento__paciente",
            "medico__user",
            "hospital",
        ).all()
        return queryset.filter(patient_scope_filter(self.request.user, "retorno__teleconsulta__atendimento__paciente__cpf"))

    def perform_create(self, serializer):
        retorno = serializer.validated_data.get("retorno")
        medico = serializer.validated_data.get("medico")
        patient_cpf = only_digits(retorno.teleconsulta.atendimento.paciente.cpf) if retorno else ""

        if has_group(self.request.user, "medico_oncologista"):
            if patient_cpf not in assigned_patient_cpfs(self.request.user):
                raise PermissionDenied("Voce nao tem permissao para diagnosticar este paciente.")
            if medico and medico.user_id != self.request.user.id:
                raise PermissionDenied("O diagnostico deve ser assinado pelo oncologista logado.")

        serializer.save()


class FrontendRecordViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    serializer_class = FrontendRecordSerializer
    permission_classes = [IsAuthenticated]
    allowed_write_roles = ("medico_ubs", "medico_oncologista")

    def get_queryset(self):
        kind = self.request.query_params.get("kind")
        if kind:
            if kind not in COLLECTION_KEYS:
                return FrontendRecord.objects.none()
            return records_for_user(self.request.user, kind)

        queryset = FrontendRecord.objects.none()
        for collection_kind in COLLECTION_KEYS:
            queryset = queryset | records_for_user(self.request.user, collection_kind)
        return queryset

    def perform_create(self, serializer):
        payload = serializer.validated_data.get("payload") or {}
        kind = serializer.validated_data.get("kind")
        if not can_write_frontend_record(self.request.user, kind, payload):
            raise PermissionDenied("Voce nao tem permissao para criar este registro.")
        serializer.save(
            patient_cpf=extract_patient_cpf(kind, payload),
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        payload = serializer.validated_data.get("payload") or serializer.instance.payload
        kind = serializer.validated_data.get("kind") or serializer.instance.kind
        if not can_write_frontend_record(self.request.user, kind, payload):
            raise PermissionDenied("Voce nao tem permissao para alterar este registro.")
        serializer.save(
            patient_cpf=extract_patient_cpf(kind, payload),
            updated_by=self.request.user,
        )

    def perform_destroy(self, instance):
        if not can_write_frontend_record(self.request.user, instance.kind, instance.payload):
            raise PermissionDenied("Voce nao tem permissao para remover este registro.")
        instance.delete()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        nome = str(request.data.get("nome", "")).strip()
        cpf = str(request.data.get("cpf", "")).strip()
        data_nascimento = request.data.get("data") or request.data.get("dataNascimento")
        email = str(request.data.get("email", "")).strip().lower()
        senha = request.data.get("senha") or request.data.get("password")

        errors = {}
        if not nome:
            errors["nome"] = ["Nome é obrigatório."]
        if not cpf:
            errors["cpf"] = ["CPF é obrigatório."]
        if not data_nascimento:
            errors["data"] = ["Data de nascimento é obrigatória."]
        if not email:
            errors["email"] = ["E-mail é obrigatório."]
        if not senha:
            errors["senha"] = ["Senha é obrigatória."]
        if len(str(senha or "")) < 6:
            errors["senha"] = ["A senha deve ter no mínimo 6 caracteres."]
        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            errors["email"] = ["Já existe uma conta com este e-mail."]
        if cpf and UserProfile.objects.filter(cpf=cpf).exists():
            errors["cpf"] = ["Já existe uma conta com este CPF."]

        if errors:
            return api_response(None, "Dados inválidos.", status.HTTP_400_BAD_REQUEST, False, errors)

        first_name, last_name = split_name(nome)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=senha,
            first_name=first_name,
            last_name=last_name,
        )
        profile = ensure_profile(
            user,
            nome=nome,
            cpf=cpf,
            data_nascimento=data_nascimento,
            grupos=["paciente"],
        )
        ensure_groups(user, ["paciente"])
        create_or_update_patient_record(user, profile)

        return api_response(
            {"usuario": frontend_user(user)},
            "Conta criada com sucesso.",
            status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        entrada = str(
            request.data.get("email")
            or request.data.get("username")
            or request.data.get("login")
            or ""
        ).strip().lower()
        senha = request.data.get("senha") or request.data.get("password") or ""

        user = User.objects.filter(email__iexact=entrada).first() or User.objects.filter(username__iexact=entrada).first()
        if not user:
            cpf = only_digits(entrada)
            profile = UserProfile.objects.filter(cpf=entrada).first()
            if not profile and cpf:
                profile = next((p for p in UserProfile.objects.all() if only_digits(p.cpf) == cpf), None)
            user = profile.user if profile else None

        authenticated = authenticate(username=user.username, password=senha) if user else None
        if authenticated is None:
            return api_response(
                None,
                "Usuário ou senha inválidos.",
                status.HTTP_401_UNAUTHORIZED,
                False,
                {"credentials": ["Verifique seu e-mail/CPF e senha."]},
            )

        refresh = RefreshToken.for_user(authenticated)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "token": str(refresh.access_token),
            "usuario": frontend_user(authenticated),
            "usuarios": [frontend_user(item) for item in allowed_users_for(authenticated)],
            "collections": all_collections(authenticated),
        }
        return api_response(data, "Login realizado com sucesso.")


class BootstrapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(
            {
                "usuario": frontend_user(request.user),
                "usuarios": [frontend_user(item) for item in allowed_users_for(request.user)],
                "collections": all_collections(request.user),
            }
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(frontend_user(request.user))

    @transaction.atomic
    def put(self, request):
        user = request.user
        profile = ensure_profile(user)

        nome = str(request.data.get("nome", profile.nome)).strip()
        email = str(request.data.get("email", user.email or user.username)).strip().lower()
        cpf = str(request.data.get("cpf", profile.cpf or "")).strip()

        if email and User.objects.exclude(id=user.id).filter(email=email).exists():
            return api_response(None, "Dados inválidos.", status.HTTP_400_BAD_REQUEST, False, {"email": ["E-mail já está em uso."]})
        if cpf and UserProfile.objects.exclude(id=profile.id).filter(cpf=cpf).exists():
            return api_response(None, "Dados inválidos.", status.HTTP_400_BAD_REQUEST, False, {"cpf": ["CPF já está em uso."]})

        first_name, last_name = split_name(nome)
        user.email = email
        user.username = email or user.username
        user.first_name = first_name
        user.last_name = last_name
        user.save(update_fields=["email", "username", "first_name", "last_name"])

        profile.nome = nome
        profile.cpf = cpf or None
        profile.data_nascimento = parse_date(request.data.get("dataNascimento") or request.data.get("data")) or profile.data_nascimento
        profile.telefone = request.data.get("telefone", profile.telefone) or ""
        profile.cartao_sus = request.data.get("cartaoSus", profile.cartao_sus) or ""
        profile.foto = request.data.get("foto", profile.foto) or ""
        profile.save()

        if "paciente" in profile.grupos:
            create_or_update_patient_record(user, profile)

        data = {
            "usuario": frontend_user(user),
            "usuarios": [frontend_user(item) for item in allowed_users_for(user)],
            "collections": all_collections(user),
        }
        return api_response(data, "Perfil atualizado com sucesso.")

    patch = put


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        senha_atual = request.data.get("senhaAtual") or request.data.get("old_password") or ""
        nova_senha = request.data.get("novaSenha") or request.data.get("new_password") or ""

        if not request.user.check_password(senha_atual):
            return api_response(None, "Senha atual incorreta.", status.HTTP_400_BAD_REQUEST, False, {"senhaAtual": ["Senha atual incorreta."]})
        if not nova_senha:
            return api_response(None, "Dados invalidos.", status.HTTP_400_BAD_REQUEST, False, {"novaSenha": ["A nova senha e obrigatoria."]})

        try:
            validate_password(str(nova_senha), request.user)
        except ValidationError as exc:
            return api_response(None, "Dados invalidos.", status.HTTP_400_BAD_REQUEST, False, {"novaSenha": list(exc.messages)})

        request.user.set_password(nova_senha)
        request.user.save(update_fields=["password"])

        refresh = RefreshToken.for_user(request.user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "usuario": frontend_user(request.user),
            "usuarios": [frontend_user(item) for item in allowed_users_for(request.user)],
            "collections": all_collections(request.user),
        }
        return api_response(data, "Senha alterada com sucesso.")


class CollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, kind):
        if kind not in COLLECTION_KEYS:
            return api_response(None, "Coleção inválida.", status.HTTP_404_NOT_FOUND, False)
        return api_response(collection_items(request.user, kind))

    def put(self, request, kind):
        if kind not in COLLECTION_KEYS:
            return api_response(None, "Coleção inválida.", status.HTTP_404_NOT_FOUND, False)

        items = request.data.get("items", request.data)
        if not isinstance(items, list):
            return api_response(None, "Envie uma lista de registros.", status.HTTP_400_BAD_REQUEST, False, {"items": ["Lista inválida."]})

        try:
            data = replace_collection(request.user, kind, items)
        except PermissionError as exc:
            return api_response(None, str(exc), status.HTTP_403_FORBIDDEN, False)
        except ValueError as exc:
            return api_response(None, str(exc), status.HTTP_400_BAD_REQUEST, False)

        return api_response(data, "Coleção sincronizada com sucesso.")
