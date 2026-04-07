from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel


class Usuario(AbstractUser):
    class TipoUsuario(models.TextChoices):
        PACIENTE = "paciente", "Paciente"
        MEDICO_NAVEGADOR = "medico_navegador", "Médico Navegador" 
        ADMINISTRADOR = "administrador",    "Administrador"

    tipo_usuario = models.CharField(
        max_length=20,
        choices=TipoUsuario.choices,
        blank=True,
    )
    email = models.EmailField(unique=True, blank=True)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="user_usuarios",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="user_usuarios",
        blank=True,
    )

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
        ordering = ['id']

    def __str__(self):
        return f"{self.username}"

    @property
    def is_paciente(self):
        return self.tipo_usuario == self.TipoUsuario.PACIENTE

    @property
    def is_medico_navegador(self):  # ← alterado
        return self.tipo_usuario == self.TipoUsuario.MEDICO_NAVEGADOR

    @property
    def is_administrador(self):
        return self.tipo_usuario == self.TipoUsuario.ADMINISTRADOR

    @property
    def perfil(self):
        if self.is_paciente:
            return getattr(self, "paciente", None)
        if self.is_medico_navegador: 
            return getattr(self, "mediconavegador", None) 
        return None

class Paciente(BaseModel):
    usuario = models.OneToOneField(
        "user.Usuario",
        on_delete=models.CASCADE,
        related_name="paciente",
    )
    ubs = models.ForeignKey(
        "unidades.UnidadeBasicaDeSaude",   # ← nome atualizado
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="pacientes",
    )
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField()
    telefone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"

    def __str__(self):
        return f"Paciente: {self.usuario.get_full_name()}"


class MedicoNavegador(BaseModel):  # ← alterado
    usuario = models.OneToOneField(
        "user.Usuario",
        on_delete=models.CASCADE,
        related_name="mediconavegador",  # ← alterado
    )
    ubs = models.ForeignKey(
        "unidades.UnidadeBasicaDeSaude",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="medicos_navegadores",  # ← alterado
    )
    crm = models.CharField(max_length=20, unique=True)
    registro_profissional = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "Médico Navegador"           # ← alterado
        verbose_name_plural = "Médicos Navegadores" # ← alterado

    def __str__(self):
        return f"Dr(a). {self.usuario.get_full_name()} — CRM {self.crm}"