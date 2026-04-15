from rest_framework import serializers
from django.contrib.auth.models import User
from app.models import (
    UnidadeBasicaDeSaude,
    CRM,
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


class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadeBasicaDeSaude
        fields = [
            'id', 'nome', 'cnes', 'cidade', 'estado', 'endereco',
            'created_at', 'updated_at', 'is_deleted'
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }


class CRMSerializer(serializers.ModelSerializer):
    class Meta:
        model = CRM
        fields = ['id', 'numero']


class MedicoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Medico
        fields = [
            'id',
            'user',
            'tipo',
            'tipo_display',
            'ubs',
            'crm',
            'created_at',
            'updated_at',
            'is_deleted'
        ]
        read_only_fields = ['user']


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalTratamento
        fields = [
            'id', 'nome', 'cnes', 'cidade', 'estado', 'endereco',
            'created_at', 'updated_at', 'is_deleted'
        ]


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'id',
            'user',
            'ubs',
            'nome',
            'nome_social',
            'cpf',
            'cartao_sus',
            'data_nascimento',
            'telefone',
            'endereco',
            'sexo',
            'raca_cor',
            'created_at',
            'updated_at',
            'is_deleted'
        ]


class AtendimentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    medico_nome = serializers.CharField(source='medico.user.get_full_name', read_only=True)
    ubs_nome = serializers.CharField(source='ubs.nome', read_only=True)
    
    class Meta:
        model = Atendimento
        fields = [
            'id',
            'paciente',
            'paciente_nome',
            'medico',
            'medico_nome',
            'ubs',
            'ubs_nome',
            'data_atendimento',
            'observacao_clinica',
            'created_at',
            'updated_at'
        ]


class TeleconsultaSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='atendimento.paciente.nome', read_only=True)
    medico_nome = serializers.CharField(source='atendimento.medico.user.get_full_name', read_only=True)
    
    class Meta:
        model = Teleconsulta
        fields = [
            'id',
            'atendimento',
            'paciente_nome',
            'medico_nome',
            'link',
            'status',
            'data_agendada',
            'data_realizada'
        ]


class RetornoTeleconsultaSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='teleconsulta.atendimento.paciente.nome', read_only=True)
    
    class Meta:
        model = RetornoTeleconsulta
        fields = [
            'id',
            'teleconsulta',
            'paciente_nome',
            'link',
            'status',
            'data_agendada',
            'data_realizada'
        ]


class SolicitacaoExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoExame
        fields = '__all__'   # por enquanto mantemos simples


class ResultadoExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultadoExame
        fields = '__all__'


class DiagnosticoSerializer(serializers.ModelSerializer):
    positivo_display = serializers.CharField(source='get_positivo_display', read_only=True)
    paciente_nome = serializers.CharField(source='retorno.teleconsulta.atendimento.paciente.nome', read_only=True)
    medico_nome = serializers.CharField(source='medico.user.get_full_name', read_only=True)
    
    class Meta:
        model = Diagnostico
        fields = [
            'id',
            'retorno',
            'paciente_nome',
            'medico',
            'medico_nome',
            'hospital',
            'descricao',
            'positivo',
            'positivo_display',
            'tipo_cancer',
            'data_diagnostico'
        ]