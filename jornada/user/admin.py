from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from django.db import transaction # Para garantir que a criação do usuário e do perfil sejam simultâneas, caso contrário, se um falhar, o outro falha
from .models import Usuario, Paciente, MedicoNavegador
from unidades.models import UnidadeBasicaDeSaude

# Bloco 1: 
class UsuarioCreationForm(UserCreationForm):
    ubs = forms.ModelChoiceField(
        queryset=UnidadeBasicaDeSaude.objects.all(),
        required=True,
        label="Unidade Básica de Saúde",
    )

    # Campos de Paciente
    cpf = forms.CharField(
        max_length=14,
        required=False,
        label="CPF",
        help_text="Obrigatório para pacientes. Formato: 000.000.000-00",
    )
    data_nascimento = forms.DateField(
        required=False,
        label="Data de nascimento",
        widget=forms.DateInput(attrs={"type": "date"}),
    )
    telefone = forms.CharField(
        max_length=20,
        required=False,
        label="Telefone",
    )

    # Campos de MedicoNavegador
    crm = forms.CharField(
        max_length=20,
        required=False,
        label="CRM",
        help_text="Obrigatório para médicos navegadores.",
    )
    registro_profissional = forms.CharField(
        max_length=50,
        required=False,
        label="Registro profissional",
    )

    class Meta(UserCreationForm.Meta):
        model  = Usuario
        fields = ("username", "first_name", "last_name",
                  "email", "tipo_usuario")

# Bloco 3: O clean é o método do Django responsável por validar o formulário antes de salvar qualquer coisa. Ele roda automaticamente quando o formulário é submetido. Aqui, estamos usando ele para garantir que os campos obrigatórios para cada tipo de usuário sejam preenchidos corretamente. Se o tipo for "Paciente", o CPF e a data de nascimento devem ser preenchidos. Se o tipo for "Médico Regulador", o CRM deve ser preenchido. Se alguma dessas validações falhar, um erro será adicionado ao formulário, e o usuário verá uma mensagem indicando o que precisa ser corrigido.
    def clean(self):
        cleaned_data = super().clean()
        tipo = cleaned_data.get("tipo_usuario")

        if tipo == Usuario.TipoUsuario.PACIENTE:
            if not cleaned_data.get("cpf"):
                self.add_error("cpf", "CPF é obrigatório para pacientes.")
            if not cleaned_data.get("data_nascimento"):
                self.add_error("data_nascimento",
                               "Data de nascimento é obrigatória para pacientes.")

        if tipo == Usuario.TipoUsuario.MEDICO_NAVEGADOR:  # ← alterado
            if not cleaned_data.get("crm"):
                self.add_error("crm",
                               "CRM é obrigatório para médicos navegadores.")  # ← alterado

        return cleaned_data

# Bloco 4: Formulário para edição do usuário (sem a necessidade de preencher senha novamente)
class UsuarioChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model  = Usuario
        fields = "__all__"

# Bloco 5: Admin personalizado para o modelo de usuário, usando os formulários criados e organizando os campos em seções para facilitar a criação e edição dos usuários com diferentes tipos de perfil.
# O coração do código está aqui, onde garantimos que ao criar um usuário, o perfil correspondente seja criado automaticamente, e os campos sejam validados de acordo com o tipo de usuário selecionado.
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    add_form = UsuarioCreationForm
    form = UsuarioChangeForm

    list_display = ("username", "get_full_name", "email",
                    "tipo_usuario", "is_active")
    list_filter = ("tipo_usuario", "is_active")

    # Tela de CRIAÇÃO — campos agrupados por seção
    add_fieldsets = (
        ("Dados de acesso", {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2"),
        }),
        ("Dados pessoais", {
            "classes": ("wide",),
            "fields": ("first_name", "last_name", "tipo_usuario", "ubs"),
        }),
        ("Dados do paciente", {
            "classes": ("wide",),
            "description": "Preencha apenas se o tipo for Paciente.",
            "fields": ("cpf", "data_nascimento", "telefone"),
        }),
        ("Dados do médico navegador", {  # ← alterado
            "classes": ("wide",),
            "description": "Preencha apenas se o tipo for Médico Navegador.",  # ← alterado
            "fields": ("crm", "registro_profissional"),
        }),
    )

    # Tela de EDIÇÃO
    fieldsets = UserAdmin.fieldsets + (
        ("Tipo de acesso", {"fields": ("tipo_usuario",)}),
    )
# Bloco 6: Sobrescreve o método de salvar para criar o perfil correspondente ao tipo do usuário
    def save_model(self, request, obj, form, change):
        with transaction.atomic():
            super().save_model(request, obj, form, change)

            tipo = form.cleaned_data.get("tipo_usuario")
            ubs  = form.cleaned_data.get("ubs")

            if tipo == Usuario.TipoUsuario.PACIENTE:
                Paciente.objects.get_or_create(
                    usuario=obj,
                    defaults={
                        "ubs":             ubs,
                        "cpf":             form.cleaned_data.get("cpf", ""),
                        "data_nascimento": form.cleaned_data.get("data_nascimento"),
                        "telefone":        form.cleaned_data.get("telefone", ""),
                    }
                )

            elif tipo == Usuario.TipoUsuario.MEDICO_NAVEGADOR:
                MedicoNavegador.objects.get_or_create(
                    usuario=obj,
                    defaults={
                        "ubs":                   ubs,
                        "crm":                   form.cleaned_data.get("crm", ""),
                        "registro_profissional": form.cleaned_data.get("registro_profissional", ""),
                    }
                )
                
# Bloco 7: Registra os perfis para aparecerem no admin, com campos de busca e exibição personalizados
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display  = ("usuario", "cpf", "ubs")
    search_fields = ("usuario__first_name", "cpf")


@admin.register(MedicoNavegador)  # ← alterado
class MedicoNavegadorAdmin(admin.ModelAdmin):  # ← alterado
    list_display  = ("usuario", "crm", "ubs")
    search_fields = ("usuario__first_name", "crm")