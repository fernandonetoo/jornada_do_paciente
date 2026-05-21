from django.contrib import admin
from .models import (
    CRM,
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


@admin.register(UnidadeBasicaDeSaude)
class UnidadeBasicaDeSaudeAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cnes', 'cidade', 'estado']
    search_fields = ['nome', 'cnes']
    list_filter = ['estado', 'cidade']


@admin.register(CRM)
class CRMAdmin(admin.ModelAdmin):
    list_display = ['numero']
    search_fields = ['numero']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cpf', 'user', 'grupos']
    search_fields = ['nome', 'cpf', 'user__email', 'user__username']
    list_filter = ['grupos']


@admin.register(FrontendRecord)
class FrontendRecordAdmin(admin.ModelAdmin):
    list_display = ['kind', 'patient_cpf', 'created_by', 'updated_at', 'is_deleted']
    search_fields = ['kind', 'patient_cpf']
    list_filter = ['kind', 'is_deleted']
    

@admin.register(Medico)
class MedicoAdmin(admin.ModelAdmin):
    list_display = ['user', 'tipo', 'crm', 'ubs']
    search_fields = ['user__first_name', 'user__last_name', 'crm__numero']
    list_filter = ['tipo', 'ubs']


@admin.register(HospitalTratamento)
class HospitalTratamentoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cidade']
    search_fields = ['nome', 'cidade']


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cpf', 'cartao_sus', 'ubs', 'sexo']
    search_fields = ['nome', 'cpf', 'cartao_sus']
    list_filter = ['ubs', 'sexo', 'raca_cor']


@admin.register(Atendimento)
class AtendimentoAdmin(admin.ModelAdmin):
    list_display = ['paciente', 'medico', 'ubs', 'data_atendimento']
    search_fields = ['paciente__nome', 'medico__user__first_name']
    list_filter = ['ubs']


@admin.register(Teleconsulta)
class TeleconsultaAdmin(admin.ModelAdmin):
    list_display = ['atendimento', 'status', 'data_agendada', 'data_realizada']
    list_filter = ['status']
    search_fields = ['atendimento__paciente__nome']


@admin.register(RetornoTeleconsulta)
class RetornoTeleconsultaAdmin(admin.ModelAdmin):
    list_display = ['teleconsulta', 'status', 'data_agendada']
    list_filter = ['status']
    search_fields = ['teleconsulta__atendimento__paciente__nome']


@admin.register(SolicitacaoExame)
class SolicitacaoExameAdmin(admin.ModelAdmin):
    list_display = ['descricao', 'data_solicitacao', 'teleconsulta', 'retorno']
    search_fields = ['descricao']


@admin.register(ResultadoExame)
class ResultadoExameAdmin(admin.ModelAdmin):
    list_display = ['solicitacao', 'data_resultado']


@admin.register(Diagnostico)
class DiagnosticoAdmin(admin.ModelAdmin):
    list_display = [
        'retorno', 
        'medico', 
        'positivo_display', 
        'tipo_cancer', 
        'data_diagnostico'
    ]
    list_filter = ['positivo', 'data_diagnostico']
    search_fields = ['descricao', 'tipo_cancer', 'retorno__teleconsulta__atendimento__paciente__nome']
    
    # Método auxiliar para mostrar "Sim" / "Não" no lugar de "S" / "N"
    def positivo_display(self, obj):
        return obj.get_positivo_display()
    positivo_display.short_description = 'Positivo'
    positivo_display.admin_order_field = 'positivo'
