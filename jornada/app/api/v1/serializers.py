from rest_framework import serializers
from django.contrib.auth.models import Group, User
from django.db import transaction
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
            'id', 'nome', 'cnes', 'cidade', 'estado', 'endereco'
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

    # Campos de saída (GET)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    user_nome    = serializers.CharField(source='user.get_full_name', read_only=True)
    ubs_nome     = serializers.CharField(source='ubs.nome', read_only=True)
    crm_numero   = serializers.CharField(source='crm.numero', read_only=True)

    # Campos de entrada (POST)
    username     = serializers.CharField(write_only=True)
    first_name   = serializers.CharField(write_only=True)
    last_name    = serializers.CharField(write_only=True)
    email        = serializers.EmailField(write_only=True)
    password     = serializers.CharField(write_only=True)
    numero_crm   = serializers.CharField(write_only=True)

    class Meta:
        model  = Medico
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'user_nome',
            'tipo',
            'tipo_display',
            'ubs',
            'ubs_nome',
            'numero_crm',
            'crm_numero',
        ]

    # ──────────────────────────────────────────
    # Validações ded username, email e número do CRM e tipo do médico.
    # ──────────────────────────────────────────

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                f"O username '{value}' já está em uso."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                f"O email '{value}' já está em uso."
            )
        return value

    def validate_numero_crm(self, value):
        if CRM.objects.filter(numero=value).exists():
            raise serializers.ValidationError(
                f"O CRM {value} já está cadastrado no sistema."
            )
        return value

    def validate(self, data):
        tipo = data.get('tipo')
        ubs  = data.get('ubs')

        if tipo == Medico.Tipo.UBS and not ubs:
            raise serializers.ValidationError(
                {"ubs": "Médico do tipo UBS deve estar vinculado a uma UBS."}
            )
        if tipo == Medico.Tipo.ONCOLOGISTA and ubs:
            raise serializers.ValidationError(
                {"ubs": "Oncologista não deve ser vinculado a uma UBS."}
            )
        return data

    # ──────────────────────────────────────────
    # Métodos privados para criar usuário e CRM associados ao médico.
    # ──────────────────────────────────────────

    def _criar_usuario(self, validated_data):
        return User.objects.create_user(
            username   = validated_data.pop('username'),
            first_name = validated_data.pop('first_name'),
            last_name  = validated_data.pop('last_name'),
            email      = validated_data.pop('email'),
            password   = validated_data.pop('password'),
        )

    def _criar_crm(self, validated_data):
        numero = validated_data.pop('numero_crm')
        return CRM.objects.create(numero=numero)


    # ──────────────────────────────────────────
    # Create para criar o medico e crm.
    # ──────────────────────────────────────────
    
    def create(self, validated_data):
        with transaction.atomic():  # Garante que a operação seja um "tudo ou nada"
            user = self._criar_usuario(validated_data)
            crm = self._criar_crm(validated_data)
            medico = Medico.objects.create(user=user, crm=crm, **validated_data)
            return medico



class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalTratamento
        fields = [
            'id', 'nome', 'cnes', 'cidade', 'estado', 'endereco'
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
            'raca_cor'
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