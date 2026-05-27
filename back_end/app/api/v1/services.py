from datetime import date
import re

from django.contrib.auth.models import Group, User
from django.db import transaction
from django.utils import timezone

from app.models import FrontendRecord, UserProfile


COLLECTION_KEYS = [
    FrontendRecord.Kind.PACIENTES,
    FrontendRecord.Kind.CONSULTA,
    FrontendRecord.Kind.EXAMES,
    FrontendRecord.Kind.REGULACAO,
    FrontendRecord.Kind.DIAGNOSTICOS,
]

ADMIN_GROUP = "admin"
PACIENTE_GROUP = "paciente"
MEDICO_UBS_GROUP = "medico_ubs"
MEDICO_ONCOLOGISTA_GROUP = "medico_oncologista"


def only_digits(value):
    return re.sub(r"\D", "", str(value or ""))


def split_name(nome):
    parts = str(nome or "").strip().split()
    if not parts:
        return "", ""
    return parts[0], " ".join(parts[1:])


def parse_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def calculate_age(value):
    born = parse_date(value)
    if not born:
        return ""
    today = timezone.localdate()
    return str(today.year - born.year - ((today.month, today.day) < (born.month, born.day)))


def ensure_groups(user, grupos):
    for group_name in grupos or []:
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)


def ensure_profile(user, **defaults):
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            "nome": defaults.get("nome") or user.get_full_name() or user.email or user.username,
            "cpf": defaults.get("cpf") or None,
            "data_nascimento": parse_date(defaults.get("data_nascimento")),
            "telefone": defaults.get("telefone", ""),
            "cartao_sus": defaults.get("cartao_sus", ""),
            "foto": defaults.get("foto", ""),
            "grupos": defaults.get("grupos", []),
        },
    )
    if created:
        ensure_groups(user, profile.grupos)
    return profile


def user_groups(user):
    profile = getattr(user, "profile", None)
    if profile and profile.grupos:
        return profile.grupos
    return list(user.groups.values_list("name", flat=True))


def has_group(user, group_name):
    return group_name in user_groups(user)


def has_any_group(user, group_names):
    groups = set(user_groups(user))
    return any(group_name in groups for group_name in group_names)


def is_admin_user(user):
    return bool(user and (user.is_superuser or has_group(user, ADMIN_GROUP)))


def frontend_user(user):
    profile = ensure_profile(user)
    nome = profile.nome or user.get_full_name() or user.email or user.username
    data_nascimento = profile.data_nascimento.isoformat() if profile.data_nascimento else ""

    return {
        "id": user.id,
        "email": user.email or user.username,
        "username": user.username,
        "nome": nome,
        "cpf": profile.cpf or "",
        "data": data_nascimento,
        "dataNascimento": data_nascimento,
        "telefone": profile.telefone or "",
        "cartaoSus": profile.cartao_sus or "",
        "foto": profile.foto or "",
        "fotoPerfil": profile.foto or "",
        "grupos": user_groups(user),
    }


def allowed_users_for(user):
    if is_admin_user(user):
        return User.objects.select_related("profile").all().order_by("email")

    if has_group(user, MEDICO_UBS_GROUP):
        ids = [
            candidate.id
            for candidate in User.objects.select_related("profile").all()
            if candidate.id == user.id
            or has_any_group(candidate, [PACIENTE_GROUP, MEDICO_ONCOLOGISTA_GROUP])
        ]
        return User.objects.select_related("profile").filter(id__in=ids).order_by("email")

    if has_group(user, MEDICO_ONCOLOGISTA_GROUP):
        assigned_cpfs = set(assigned_patient_cpfs(user))
        ids = [
            candidate.id
            for candidate in User.objects.select_related("profile").all()
            if candidate.id == user.id
            or (
                getattr(candidate, "profile", None)
                and only_digits(candidate.profile.cpf) in assigned_cpfs
            )
        ]
        return User.objects.select_related("profile").filter(id__in=ids).order_by("email")

    return User.objects.select_related("profile").filter(id=user.id)


def extract_patient_cpf(kind, payload):
    if kind == FrontendRecord.Kind.PACIENTES:
        return only_digits(payload.get("cpf"))
    return only_digits(
        payload.get("pacienteId")
        or payload.get("pacienteCpf")
        or payload.get("cpf")
    )


def record_payload(record):
    payload = dict(record.payload or {})
    payload.setdefault("backendId", record.id)
    return payload


def assigned_patient_cpfs(user):
    email = (user.email or user.username or "").lower()
    cpfs = []
    for record in FrontendRecord.objects.filter(kind=FrontendRecord.Kind.REGULACAO):
        payload = record.payload or {}
        if str(payload.get("medicoEmail", "")).lower() == email:
            cpfs.append(record.patient_cpf)
    return [cpf for cpf in cpfs if cpf]


def records_for_user(user, kind):
    queryset = FrontendRecord.objects.filter(kind=kind)

    if is_admin_user(user) or has_group(user, MEDICO_UBS_GROUP):
        return queryset

    if has_group(user, PACIENTE_GROUP):
        profile = ensure_profile(user)
        return queryset.filter(patient_cpf=only_digits(profile.cpf))

    if has_group(user, MEDICO_ONCOLOGISTA_GROUP):
        if kind == FrontendRecord.Kind.REGULACAO:
            email = (user.email or user.username or "").lower()
            ids = [
                record.id
                for record in queryset
                if str((record.payload or {}).get("medicoEmail", "")).lower() == email
            ]
            return queryset.filter(id__in=ids)
        return queryset.filter(patient_cpf__in=assigned_patient_cpfs(user))

    return queryset.none()


def collection_items(user, kind):
    return [record_payload(record) for record in records_for_user(user, kind).order_by("-created_at", "-id")]


def all_collections(user):
    return {kind: collection_items(user, kind) for kind in COLLECTION_KEYS}


def can_replace_collection(user, kind):
    if is_admin_user(user):
        return True
    if has_group(user, MEDICO_UBS_GROUP):
        return kind != FrontendRecord.Kind.DIAGNOSTICOS
    return has_group(user, MEDICO_ONCOLOGISTA_GROUP) and kind == FrontendRecord.Kind.DIAGNOSTICOS


def can_write_frontend_record(user, kind, payload):
    patient_cpf = extract_patient_cpf(kind, payload or {})

    if is_admin_user(user):
        return True

    if has_group(user, MEDICO_UBS_GROUP):
        return kind != FrontendRecord.Kind.DIAGNOSTICOS

    if has_group(user, MEDICO_ONCOLOGISTA_GROUP) and kind == FrontendRecord.Kind.DIAGNOSTICOS:
        return bool(patient_cpf and patient_cpf in assigned_patient_cpfs(user))

    return False


@transaction.atomic
def replace_collection(user, kind, items):
    if kind not in COLLECTION_KEYS:
        raise ValueError("Coleção inválida.")
    if not can_replace_collection(user, kind):
        raise PermissionError("Você não tem permissão para alterar esta coleção.")

    records_for_user(user, kind).delete()
    created = []

    for item in items:
        payload = dict(item or {})
        if not can_write_frontend_record(user, kind, payload):
            raise PermissionError("Voce nao tem permissao para alterar registros fora do seu escopo.")

        patient_cpf = extract_patient_cpf(kind, payload)
        record = FrontendRecord.objects.create(
            kind=kind,
            patient_cpf=patient_cpf,
            payload=payload,
            created_by=user,
            updated_by=user,
        )
        created.append(record_payload(record))

    return created


def create_or_update_patient_record(user, profile):
    cpf = only_digits(profile.cpf)
    if not cpf:
        return None

    payload = {
        "id": int(timezone.now().timestamp() * 1000),
        "nome": profile.nome,
        "idade": calculate_age(profile.data_nascimento),
        "cpf": profile.cpf,
        "contato": profile.telefone,
        "endereco": "",
        "suspeita": "",
        "dataNascimento": profile.data_nascimento.isoformat() if profile.data_nascimento else "",
        "cartaoSus": profile.cartao_sus,
        "medico": "",
        "criadoEm": timezone.now().isoformat(),
    }

    record, _ = FrontendRecord.objects.update_or_create(
        kind=FrontendRecord.Kind.PACIENTES,
        patient_cpf=cpf,
        defaults={"payload": payload, "created_by": user, "updated_by": user},
    )
    return record
