from rest_framework import serializers
from django.contrib.auth.models import User
from datetime import datetime
from django.utils import timezone
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


class DataAtendimentoField(serializers.CharField):
    def to_internal_value(self, value):
        try:
            dt = datetime.strptime(value, "%d/%m/%Y %H:%M")
            return timezone.make_aware(dt)
        except ValueError:
            raise serializers.ValidationError(
                "Formato de data inválido. Use DD/MM/AAAA HH:MM — ex: 13/05/2026 10:30"
            )


class DataHoraField(serializers.CharField):
    def to_internal_value(self, value):
        try:
            dt = datetime.strptime(value, "%d/%m/%Y %H:%M")
            return timezone.make_aware(dt)
        except ValueError:
            raise serializers.ValidationError(
                "Formato de data inválido. Use DD/MM/AAAA HH:MM — ex: 20/05/2026 10:00"
            )

    def to_representation(self, value):
        if value:
            return value.strftime("%d/%m/%Y %H:%M")
        return None


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
    # Validações de username, email e número do CRM e tipo do médico.
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
    
    # Trata a validação dos grupos dos médicos. (retirar)
    def validate(self, data):
        tipo = data.get('tipo')
        ubs  = data.get('ubs')

        if tipo == Medico.Tipo.ubs and not ubs:
            raise serializers.ValidationError(
                {"ubs": "Médico do tipo UBS deve estar vinculado a uma UBS."}
            )
        if tipo == Medico.Tipo.oncologista and ubs:
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

    # Campos de saída (GET)
    user_nome        = serializers.CharField(source='user.get_full_name', read_only=True)
    ubs_nome         = serializers.CharField(source='ubs.nome', read_only=True)
    sexo_display     = serializers.CharField(source='get_sexo_display', read_only=True)
    raca_cor_display = serializers.CharField(source='get_raca_cor_display', read_only=True)

    # Campos de entrada (POST)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    nome_ubs = serializers.CharField(write_only=True)

    class Meta:
        model  = Paciente
        fields = [
            'id',
            'username',
            'password',
            'user_nome',
            'nome_ubs',
            'ubs_nome',
            'nome',
            'nome_social',
            'cpf',
            'cartao_sus',
            'data_nascimento',
            'telefone',
            'endereco',
            'sexo',
            'sexo_display',
            'raca_cor',
            'raca_cor_display',
        ]

    # ──────────────────────────────────────────
    # Validações
    # ──────────────────────────────────────────

    def validate_username(self, value):
        qs = User.objects.filter(username=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.user.id)
        if qs.exists():
            raise serializers.ValidationError(
                f"O username '{value}' já está em uso."
            )
        return value

    def validate_cpf(self, value):
        qs = Paciente.objects.filter(cpf=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                f"O CPF {value} já está cadastrado no sistema."
            )
        return value

    def validate_cartao_sus(self, value):
        if not value:
            return value
        qs = Paciente.objects.filter(cartao_sus=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                f"O cartão SUS {value} já está cadastrado no sistema."
            )
        return value

    def validate_ubs(self, value):
        if not value:
            raise serializers.ValidationError(
                "O paciente deve estar vinculado a uma UBS."
            )
        return value
    
    def _buscar_ubs(self, validated_data):
        nome = validated_data.pop('nome_ubs')
        return UnidadeBasicaDeSaude.objects.get(nome=nome)

    def validate_nome_ubs(self, value):
        if not UnidadeBasicaDeSaude.objects.filter(nome=value).exists():
            raise serializers.ValidationError(
                f"UBS '{value}' não encontrada no sistema."
            )
        return value

    # ──────────────────────────────────────────
    # Métodos privados
    # ──────────────────────────────────────────

    def _criar_usuario(self, validated_data):
        return User.objects.create_user(
            username = validated_data.pop('username'),
            password = validated_data.pop('password'),
        )

    # ──────────────────────────────────────────
    # Create
    # ──────────────────────────────────────────

    def create(self, validated_data):
        with transaction.atomic():
            user     = self._criar_usuario(validated_data)
            ubs      = self._buscar_ubs(validated_data)
            paciente = Paciente.objects.create(user=user, ubs=ubs, **validated_data)
        return paciente

    # ──────────────────────────────────────────
    # Update
    # ──────────────────────────────────────────

    def update(self, instance, validated_data):
        user = instance.user

        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'password' in validated_data:
            user.set_password(validated_data.pop('password'))
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class AtendimentoSerializer(serializers.ModelSerializer):

    # Campos de saída (GET)
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    medico_crm   = serializers.CharField(source='medico.crm.numero', read_only=True)
    ubs_nome      = serializers.CharField(source='ubs.nome', read_only=True)

    # Campos de entrada (POST)
    nome_paciente = serializers.CharField(write_only=True)
    crm_medico   = serializers.CharField(write_only=True)
    nome_ubs      = serializers.CharField(write_only=True)
    data_atendimento = DataAtendimentoField()

    class Meta:
        model  = Atendimento
        fields = [
            'id',
            'nome_paciente',
            'paciente_nome',
            'crm_medico',
            'medico_crm',
            'nome_ubs',
            'ubs_nome',
            'data_atendimento',
            'observacao_clinica',
            "created_at",
            "updated_at",
        ]

     # ──────────────────────────────────────────
    # Validações
    # ──────────────────────────────────────────

    def validate_nome_paciente(self, value):
        if not Paciente.objects.filter(nome=value).exists():
            raise serializers.ValidationError(
                f"Paciente '{value}' não encontrado no sistema."
            )
        return value

    def validate_crm_medico(self, value):
        if not CRM.objects.filter(numero=value).exists():
            raise serializers.ValidationError(
                f"CRM '{value}' não encontrado no sistema."
            )
        return value

    def validate_nome_ubs(self, value):
        if not UnidadeBasicaDeSaude.objects.filter(nome=value).exists():
            raise serializers.ValidationError(
                f"UBS '{value}' não encontrada no sistema."
            )
        return value

    def validate_data_atendimento(self, value):
        from django.utils import timezone
        if value > timezone.now():
            raise serializers.ValidationError(
                "A data do atendimento não pode ser no futuro."
            )
        return value

    # ──────────────────────────────────────────
    # Métodos privados
    # ──────────────────────────────────────────

    def _buscar_paciente(self, validated_data):
        nome = validated_data.pop('nome_paciente')
        return Paciente.objects.get(nome=nome)

    def _buscar_medico(self, validated_data):
        crm = validated_data.pop('crm_medico')  # <- corrigido
        return Medico.objects.get(crm__numero=crm)

    def _buscar_ubs(self, validated_data):
        nome = validated_data.pop('nome_ubs')
        return UnidadeBasicaDeSaude.objects.get(nome=nome)

    # ──────────────────────────────────────────
    # Create
    # ──────────────────────────────────────────

    def create(self, validated_data):
        paciente    = self._buscar_paciente(validated_data)
        medico      = self._buscar_medico(validated_data)
        ubs         = self._buscar_ubs(validated_data)
        atendimento = Atendimento.objects.create(
            paciente = paciente,
            medico   = medico,
            ubs      = ubs,
            **validated_data
        )
        return atendimento

    # ──────────────────────────────────────────
    # Update
    # ──────────────────────────────────────────

    def update(self, instance, validated_data):
        if 'nome_paciente' in validated_data:
            instance.paciente = self._buscar_paciente(validated_data)
        if 'crm_medico' in validated_data:
            instance.medico = self._buscar_medico(validated_data)
        if 'nome_ubs' in validated_data:
            instance.ubs = self._buscar_ubs(validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    # ──────────────────────────────────────────
    # Create
    # ──────────────────────────────────────────

    def create(self, validated_data):
        paciente   = self._buscar_paciente(validated_data)
        medico     = self._buscar_medico(validated_data)
        ubs        = self._buscar_ubs(validated_data)
        atendimento = Atendimento.objects.create(
            paciente = paciente,
            medico   = medico,
            ubs      = ubs,
            **validated_data
        )
        return atendimento

    # ──────────────────────────────────────────
    # Update
    # ──────────────────────────────────────────

    def update(self, instance, validated_data):
        if 'nome_paciente' in validated_data:
            instance.paciente = self._buscar_paciente(validated_data)
        if 'nome_medico' in validated_data:
            instance.medico = self._buscar_medico(validated_data)
        if 'nome_ubs' in validated_data:
            instance.ubs = self._buscar_ubs(validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class TeleconsultaSerializer(serializers.ModelSerializer):

    # Campos de saída (GET)
    paciente_nome  = serializers.CharField(source='atendimento.paciente.nome', read_only=True)
    medico_nome    = serializers.CharField(source='atendimento.medico.user.username', read_only=True)
    medico_crm     = serializers.CharField(source='atendimento.medico.crm.numero', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Campos de entrada (POST)
    cpf_paciente   = serializers.CharField(write_only=True)
    atendimento_id = serializers.IntegerField(write_only=True)
    data_agendada  = DataHoraField(required=False, allow_blank=True)
    data_realizada = DataHoraField(required=False, allow_blank=True)

    class Meta:
        model  = Teleconsulta
        fields = [
            'id',
            'cpf_paciente',
            'atendimento_id',
            'paciente_nome',
            'medico_crm',
            "medico_nome",
            'link',
            'status',
            'status_display',
            'data_agendada',
            'data_realizada',
        ]
        

    # ──────────────────────────────────────────
    # Validações
    # ──────────────────────────────────────────

    def validate_cpf_paciente(self, value):
        if not Paciente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError(
                f"Paciente com CPF '{value}' não encontrado."
            )
        return value

    def validate_atendimento_id(self, value):
        if not Atendimento.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f"Atendimento com ID '{value}' não encontrado."
            )
        if Teleconsulta.objects.filter(atendimento_id=value).exists():
            raise serializers.ValidationError(
                "Este atendimento já possui uma teleconsulta vinculada."
            )
        return value


    def validate(self, data):
        cpf           = data.get('cpf_paciente')
        atendimento_id = data.get('atendimento_id')

        if cpf and atendimento_id:
            atendimento = Atendimento.objects.filter(
                id              = atendimento_id,
                paciente__cpf   = cpf,
            ).first()

            if not atendimento:
                raise serializers.ValidationError(
                    "O atendimento informado não pertence ao paciente com esse CPF."
                )

        return data

    def validate_data_agendada(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "A data agendada não pode ser no passado."
            )
        return value

    # ──────────────────────────────────────────
    # Métodos privados
    # ──────────────────────────────────────────

    def _buscar_atendimento(self, validated_data):
        atendimento_id = validated_data.pop('atendimento_id')
        validated_data.pop('cpf_paciente')
        return Atendimento.objects.get(id=atendimento_id)

    # ──────────────────────────────────────────
    # Create
    # ──────────────────────────────────────────

    def create(self, validated_data):
        atendimento  = self._buscar_atendimento(validated_data)
        teleconsulta = Teleconsulta.objects.create(
            atendimento = atendimento,
            status      = Teleconsulta.Status.AGENDADA,
            **validated_data
        )
        return teleconsulta

    # ──────────────────────────────────────────
    # Update
    # ──────────────────────────────────────────

    def update(self, instance, validated_data):
        novo_status    = validated_data.get('status', instance.status)
        data_realizada = validated_data.get('data_realizada')

        # Não permite voltar status já finalizado
        if instance.status in [
            Teleconsulta.Status.REALIZADA,
            Teleconsulta.Status.CANCELADA
        ]:
            raise serializers.ValidationError(
                "Não é possível alterar uma teleconsulta já realizada ou cancelada."
            )

        # data_realizada só pode ser preenchida se status for realizada
        if data_realizada and novo_status != Teleconsulta.Status.REALIZADA:
            raise serializers.ValidationError(
                {"data_realizada": "A data realizada só pode ser preenchida quando o status for 'realizada'."}
            )

        # Se status for realizada, data_realizada é obrigatória
        if novo_status == Teleconsulta.Status.REALIZADA and not data_realizada:
            raise serializers.ValidationError(
                {"data_realizada": "Informe a data realizada ao marcar a teleconsulta como realizada."}
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

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
        fields = "__all__"

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