from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework.response import Response
from app.models import (
    CRM,
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
)
from .serializers import (
    CRMSerializer,
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
)


class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = UnidadeBasicaDeSaude.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class CRMViewSet(viewsets.ModelViewSet):
    queryset = CRM.objects.all()
    serializer_class = CRMSerializer
    permission_classes = [IsAuthenticated]

class MedicoViewSet(viewsets.ModelViewSet):
    queryset           = Medico.objects.all()
    serializer_class   = MedicoSerializer
    permission_classes = [IsAuthenticated]

    # Endpoint para listar apenas os médicos inativos (deletados)
    @action(detail=False, methods=['get'], url_path='inativos')
    def inativos(self, request):
        medicos  = Medico.objects.apenas_deletados()
        serializer = self.get_serializer(medicos, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at'])

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = HospitalTratamento.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

class PacienteViewSet(viewsets.ModelViewSet):
    queryset           = Paciente.objects.all()
    serializer_class   = PacienteSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='inativos')
    def inativos(self, request):
        pacientes  = Paciente.objects.apenas_deletados()
        serializer = self.get_serializer(pacientes, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at'])

class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]

class TeleconsultaViewSet(viewsets.ModelViewSet):
    queryset           = Teleconsulta.objects.all()
    serializer_class   = TeleconsultaSerializer
    permission_classes = [IsAuthenticated]

    # Endpoint disponível por CPF de pacientes que possuem atendimentos para serem vinculados a uma teleconsulta.
    @action(detail=False, methods=['get'], url_path='atendimentos-disponiveis')
    def atendimentos_disponiveis(self, request):
        
        cpf = request.query_params.get('cpf')
        if not cpf:
            return Response(
                {"erro": "Informe o CPF do paciente."},
                status=400
            )

        paciente = Paciente.objects.filter(cpf=cpf).first()
        if not paciente:
            return Response(
                {"erro": f"Paciente com CPF '{cpf}' não encontrado."},
                status=404
            )

        atendimentos = Atendimento.objects.filter(
            paciente        = paciente,
            teleconsulta__isnull = True
        ).order_by('-data_atendimento')

        if not atendimentos.exists():
            return Response(
                {"erro": "Nenhum atendimento disponível para este paciente."},
                status=404
            )

        data = [
            {
                "id_atendimento": atendimento.id,
                "nome_paciente": atendimento.paciente.nome,
                
                "nome_medico": atendimento.medico.user.username,
                "crm_medico": atendimento.medico.crm.numero,
                "nome_ubs": atendimento.ubs.nome,
                "data_atendimento" : atendimento.data_atendimento.strftime("%d/%m/%Y %H:%M"),
                "observacao_clinica": atendimento.observacao_clinica,
            }
            for atendimento in atendimentos
        ]

        return Response(data)

class RetornoTeleconsultaViewSet(viewsets.ModelViewSet):
    queryset = RetornoTeleconsulta.objects.all()
    serializer_class = RetornoTeleconsultaSerializer
    permission_classes = [IsAuthenticated]


    @action(detail=True, methods=['patch'], url_path='retorno')
    def atualiza_status(self, request, pk=None):
        # Pega o RetornoTeleconsulta direto pelo pk
        retorno = self.get_object()
        
        novo_status = request.data.get('status')
        
        if novo_status not in ['agendado', 'cancelado', 'realizado']:
            return Response(
                {"erro": f"Status '{novo_status}' não é válido."},
                status=400
            )
        
        retorno.status = novo_status
        
        # Se for realizado, atualizar data_realizada
        if novo_status == 'realizado':
            retorno.data_realizada = timezone.now()
        
        retorno.save()
        retorno.refresh_from_db()
        
        serializer = self.get_serializer(retorno)
        return Response(serializer.data)

class SolicitacaoExameViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoExame.objects.all()
    serializer_class = SolicitacaoExameSerializer
    permission_classes = [IsAuthenticated]

class ResultadoExameViewSet(viewsets.ModelViewSet):
    queryset = ResultadoExame.objects.all()
    serializer_class = ResultadoExameSerializer
    permission_classes = [IsAuthenticated]

class DiagnosticoViewSet(viewsets.ModelViewSet):
    queryset = Diagnostico.objects.all()
    serializer_class = DiagnosticoSerializer
    permission_classes = [IsAuthenticated]

