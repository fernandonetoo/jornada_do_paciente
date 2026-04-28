from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from jsonschema import ValidationError


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def incluindo_deletados(self):
        return super().get_queryset()

    def apenas_deletados(self):
        return super().get_queryset().filter(is_deleted=True)


class BaseModel(models.Model):
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    is_deleted  = models.BooleanField(default=False)
    deleted_at  = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=["is_deleted", "deleted_at"])

    def hard_delete(self):
        super().delete()

# Modelo para representar as unidades básicas de saúde (UBS)
class UnidadeBasicaDeSaude(BaseModel):  
    class Estado(models.TextChoices):
        PARAIBA = "PB", "Paraíba"
    nome = models.CharField(max_length=100)
    cnes = models.CharField(max_length=7, unique=True)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(
        max_length=2, 
        choices=Estado.choices, 
        default=Estado.PARAIBA)
    endereco = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name  = "Unidade Básica de Saúde"
        verbose_name_plural = "Unidades Básicas de Saúde"
        ordering  = ["nome"]

    def __str__(self):
        return f"{self.nome} — {self.cidade}/{self.estado}"

# Modelo para representar os CRMs dos médicos, garantindo que cada CRM seja único no sistema
class CRM(BaseModel):
    numero = models.CharField(max_length=20, unique=True)

    class Meta:
        verbose_name        = "CRM"
        verbose_name_plural = "CRMs"

    def __str__(self):
        return self.numero

# Modelo para representar os médicos cadastrados no sistema, associando um usuário do Django, uma UBS (se for médico da UBS), um CRM e o tipo de médico (médico da UBS ou oncologista do PCC)
class Medico(BaseModel):
    class Tipo(models.TextChoices):
        UBS         = "UBS", "Médico da UBS"
        ONCOLOGISTA = "ONCOLOGISTA", "Oncologista do Paraíba Contra o Câncer"

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    tipo = models.CharField(
        max_length=12,                    
        choices=Tipo.choices,
        default=Tipo.UBS,
    )

    ubs = models.ForeignKey(
        UnidadeBasicaDeSaude,
        on_delete=models.PROTECT,
        related_name="medicos",
        null=True,
        blank=True,
    )

    crm = models.OneToOneField(
        CRM,
        on_delete=models.PROTECT,
        related_name="medico",
    )

    class Meta:
        verbose_name        = "Médico"
        verbose_name_plural = "Médicos"
        ordering            = ["user__last_name", "user__first_name"]

    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.tipo == self.Tipo.UBS:
            if not self.ubs:
                raise ValidationError({"ubs": "Médico da UBS deve estar vinculado a uma Unidade Básica de Saúde."})

    # Ajustei o save para não haver conflito com o signals.py, onde o médico é criado e depois o grupo é adicionado. O save do médico não precisa criar o usuário e o CRM, pois isso já é feito no serializer. O save do médico agora apenas chama full_clean para garantir que as validações sejam executadas, e depois salva normalmente. O signals.py continua responsável por adicionar o grupo ao usuário quando um médico é criado, e por sincronizar a inativação do médico com o usuário e o CRM. Dessa forma, evitamos conflitos entre o save do modelo e os signals, garantindo que as regras de negócio sejam respeitadas sem criar dependências circulares.
    def save(self, *args, **kwargs):
        if not kwargs.get('update_fields'):
            self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        nome = self.user.get_full_name() or self.user.username
        if self.tipo == self.Tipo.UBS:
            return f"Dr(a). {nome} — UBS {self.ubs} — CRM {self.crm.numero}"
        else:
            return f"Dr(a). {nome} — Oncologista do Paraíba Contra o Câncer — CRM {self.crm.numero}"
    
# Modelo para representar os hospitais de tratamento associados ao Programa Paraíba Contra o Câncer (PCC)
class HospitalTratamento(BaseModel):
    class Estado(models.TextChoices):
        PARAIBA = "PB", "Paraíba"
    nome = models.CharField(max_length=100)
    cnes = models.CharField(max_length=7, unique=True)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(
        max_length=2,
        choices=Estado.choices,
        default=Estado.PARAIBA,
    )
    endereco = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name        = "Hospital de Tratamento"
        verbose_name_plural = "Hospitais de Tratamento"
        ordering            = ["nome"]

    def __str__(self):
        return f"{self.nome} — {self.cidade}"
    
# Modelo para representar os pacientes cadastrados no sistema, associados a uma UBS e a um usuário do Django
class Paciente(BaseModel):
    class Sexo(models.TextChoices):
        MASCULINO = "M", "Masculino"
        FEMININO = "F", "Feminino"
        OUTRO = "O", "Outro"

    class RacaCor(models.TextChoices):
        BRANCA    = "branca",    "Branca"
        PRETA     = "preta",     "Preta"
        PARDA     = "parda",     "Parda"
        AMARELA   = "amarela",   "Amarela"
        INDIGENA  = "indigena",  "Indígena"
        NAO_INFO  = "nao_info",  "Não informado"

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ubs  = models.ForeignKey(
        UnidadeBasicaDeSaude,
        on_delete=models.PROTECT,
        related_name="pacientes",
    )
    nome = models.CharField(max_length=150)
    nome_social = models.CharField(max_length=150, blank=True)
    cpf = models.CharField(max_length=11, unique=True)
    cartao_sus = models.CharField(max_length=15, blank=True, unique=True)
    data_nascimento = models.DateField()
    telefone = models.CharField(max_length=20)
    endereco = models.CharField(max_length=255)
    sexo = models.CharField(max_length=1, choices=Sexo.choices)
    raca_cor = models.CharField(
        max_length=10,
        choices=RacaCor.choices,
        default=RacaCor.NAO_INFO,
    )

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ["nome"]

    def __str__(self):
        return self.nome

# Modelo para representar os atendimentos realizados, associando um paciente, um médico e uma UBS, além de registrar a data do atendimento e uma observação clínica.
class Atendimento(BaseModel):
    paciente           = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        related_name="atendimentos",
    )
    medico             = models.ForeignKey(
        Medico,
        on_delete=models.PROTECT,
        related_name="atendimentos",
    )
    ubs                = models.ForeignKey(
        UnidadeBasicaDeSaude,
        on_delete=models.PROTECT,
        related_name="atendimentos",
    )
    data_atendimento   = models.DateTimeField(default=timezone.now)
    observacao_clinica = models.TextField()

    class Meta:
        verbose_name  = "Atendimento"
        verbose_name_plural = "Atendimentos"
        ordering            = ["-data_atendimento"]

    # Validação para garantir que o paciente e o médico estejam associados à mesma UBS do atendimento
    def clean(self):
        if self.paciente.ubs != self.ubs:
            raise ValidationError("O paciente deve pertencer à mesma UBS do atendimento.")
        if self.medico.ubs != self.ubs:
            raise ValidationError("O médico deve pertencer à mesma UBS do atendimento.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Atendimento de {self.paciente} em {self.data_atendimento:%d/%m/%Y}"

# Modelo para representar as teleconsultas realizadas, associando um atendimento, registrando o link da teleconsulta, o status (agendada, realizada ou cancelada), a data agendada e a data realizada (se aplicável).
class Teleconsulta(BaseModel):
    class Status(models.TextChoices):
        AGENDADA   = "agendada",   "Agendada"
        REALIZADA  = "realizada",  "Realizada"
        CANCELADA  = "cancelada",  "Cancelada"

    atendimento    = models.OneToOneField(
        Atendimento,
        on_delete=models.PROTECT,
        related_name="teleconsulta",
    )
    link           = models.URLField(blank=True)
    status         = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AGENDADA,
    )
    data_agendada  = models.DateTimeField(null=True, blank=True)
    data_realizada = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name        = "Teleconsulta"
        verbose_name_plural = "Teleconsultas"
        ordering            = ["-data_agendada"]

    def __str__(self):
        return f"Teleconsulta — {self.atendimento.paciente} ({self.status})"

# Modelo para representar os retornos de teleconsulta, associando uma teleconsulta, registrando o link do retorno, o status (agendado, realizado ou cancelado), a data agendada e a data realizada (se aplicável).
class RetornoTeleconsulta(BaseModel):
    class Status(models.TextChoices):
        AGENDADO   = "agendado",   "Agendado"
        REALIZADO  = "realizado",  "Realizado"
        CANCELADO  = "cancelado",  "Cancelado"

    teleconsulta   = models.ForeignKey(
        Teleconsulta,
        on_delete=models.PROTECT,
        related_name="retornos",
    )
    link           = models.URLField(blank=True)
    status         = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AGENDADO,
    )
    data_agendada  = models.DateTimeField(null=True, blank=True)
    data_realizada = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name        = "Retorno de Teleconsulta"
        verbose_name_plural = "Retornos de Teleconsulta"
        ordering            = ["-data_agendada"]

    def __str__(self):
        return f"Retorno — {self.teleconsulta.atendimento.paciente} ({self.status})"

# Modelo para representar as solicitações de exame, associando uma teleconsulta ou um retorno de teleconsulta, registrando a descrição da solicitação e a data em que foi realizada.
class SolicitacaoExame(BaseModel):
    teleconsulta     = models.OneToOneField(
        Teleconsulta,
        on_delete=models.PROTECT,
        related_name="solicitacao_exame",
        null=True,
        blank=True,
    )
    retorno          = models.OneToOneField(
        RetornoTeleconsulta,
        on_delete=models.PROTECT,
        related_name="solicitacao_exame",
        null=True,
        blank=True,
    )
    descricao        = models.TextField()
    data_solicitacao = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name        = "Solicitação de Exame"
        verbose_name_plural = "Solicitações de Exame"
        ordering            = ["-data_solicitacao"]

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.teleconsulta and not self.retorno:
            raise ValidationError(
                "A solicitação deve estar vinculada a uma teleconsulta ou a um retorno."
            )
        if self.teleconsulta and self.retorno:
            raise ValidationError(
                "A solicitação deve estar vinculada a apenas uma origem (teleconsulta ou retorno)."
            )

    def __str__(self):
        origem = self.teleconsulta or self.retorno
        return f"Solicitação de exame — {origem}"

# Modelo para representar os resultados de exame, associando uma solicitação de exame, registrando o resultado e a data em que o resultado foi registrado.
class ResultadoExame(BaseModel):
    solicitacao    = models.OneToOneField(
        SolicitacaoExame,
        on_delete=models.PROTECT,
        related_name="resultado",
    )
    resultado      = models.TextField()
    data_resultado = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name        = "Resultado de Exame"
        verbose_name_plural = "Resultados de Exame"

    def __str__(self):
        return f"Resultado — {self.solicitacao}"
    
# Modelo para representar os diagnósticos realizados, associando um retorno de teleconsulta, um médico do PCC e um hospital de tratamento (se aplicável), registrando a descrição do diagnóstico, o status (positivo ou negativo), o tipo de câncer (se positivo) e a data do diagnóstico.
class Diagnostico(BaseModel):
    retorno = models.OneToOneField(
        RetornoTeleconsulta,
        on_delete=models.PROTECT,
        related_name="diagnostico",
    )
    
    # Médico responsável pelo diagnóstico (apenas oncologistas)
    medico = models.ForeignKey(
        Medico,
        on_delete=models.PROTECT,
        related_name="diagnosticos",
        limit_choices_to={'tipo': Medico.Tipo.ONCOLOGISTA},
    )
    
    hospital = models.ForeignKey(
        HospitalTratamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="diagnosticos",
    )
    
    # === CAMPO ALTERADO: agora com Sim/Não ===
    class Positivo(models.TextChoices):
        SIM = "S", "Sim"
        NAO = "N", "Não"

    positivo = models.CharField(
        max_length=1,
        choices=Positivo.choices,
        default=Positivo.NAO,
    )
    
    descricao = models.TextField()
    tipo_cancer = models.CharField(max_length=100, blank=True)
    data_diagnostico = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name        = "Diagnóstico"
        verbose_name_plural = "Diagnósticos"
        ordering            = ["-data_diagnostico"]

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Se o diagnóstico for "Sim", o tipo de câncer é obrigatório
        if self.positivo == self.Positivo.SIM and not self.tipo_cancer.strip():
            raise ValidationError(
                {"tipo_cancer": "O tipo de câncer deve ser informado quando o diagnóstico for positivo (Sim)."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        status = "Positivo" if self.positivo == self.Positivo.SIM else "Negativo"
        return f"Diagnóstico {status} — {self.retorno.teleconsulta.atendimento.paciente}"
