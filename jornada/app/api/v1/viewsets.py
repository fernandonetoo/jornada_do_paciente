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
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

# A partir desse viewset existem relacionamentos mais complexos entre as tabelas. 
class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]

class TeleconsultaViewSet(viewsets.ModelViewSet):
    queryset = Teleconsulta.objects.all()
    serializer_class = TeleconsultaSerializer
    permission_classes = [IsAuthenticated]

class RetornoTeleconsultaViewSet(viewsets.ModelViewSet):
    queryset = RetornoTeleconsulta.objects.all()
    serializer_class = RetornoTeleconsultaSerializer
    permission_classes = [IsAuthenticated]

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