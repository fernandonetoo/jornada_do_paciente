from rest_framework.routers import DefaultRouter
from .viewsets import (
    UnidadeViewSet,
    UserViewSet,
    MedicoViewSet,
    HospitalViewSet,
    PacienteViewSet,
    AtendimentoViewSet,
    TeleconsultaViewSet,
    RetornoTeleconsultaViewSet,
    SolicitacaoExameViewSet,
    ResultadoExameViewSet,
    DiagnosticoViewSet,
)


router = DefaultRouter()
router.register(r'unidades', UnidadeViewSet)
router.register(r'users', UserViewSet)
router.register(r'medicos', MedicoViewSet)
router.register(r'hospitais', HospitalViewSet)
router.register(r'pacientes', PacienteViewSet)
router.register(r'atendimentos', AtendimentoViewSet)
router.register(r'teleconsultas', TeleconsultaViewSet)
router.register(r'retornos', RetornoTeleconsultaViewSet)
router.register(r'solicitacoes-exame', SolicitacaoExameViewSet)
router.register(r'resultados-exame', ResultadoExameViewSet)
router.register(r'diagnosticos', DiagnosticoViewSet)

urlpatterns = router.urls
app_name = 'app_api_v1'