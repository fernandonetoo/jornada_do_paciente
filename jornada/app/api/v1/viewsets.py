from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from app.models import (
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


class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]


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