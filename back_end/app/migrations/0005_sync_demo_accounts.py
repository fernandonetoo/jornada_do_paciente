from django.contrib.auth.hashers import make_password
from django.db import migrations


USERS = [
    {
        "email": "medico@ubs.com",
        "password": "123456",
        "nome": "Dr. Joao",
        "cpf": "00000000000",
        "data_nascimento": None,
        "grupos": ["medico_ubs"],
    },
    {
        "email": "paciente@teste.com",
        "password": "123456",
        "nome": "Paciente Teste",
        "cpf": "12345678901",
        "data_nascimento": "2000-01-01",
        "grupos": ["paciente"],
    },
    {
        "email": "admin@admin.com",
        "password": "123456",
        "nome": "Administrador",
        "cpf": "99999999999",
        "data_nascimento": None,
        "grupos": ["admin"],
    },
    {
        "email": "oncologista@teste.com",
        "password": "123456",
        "nome": "Dr. Carlos",
        "cpf": "88888888888",
        "data_nascimento": None,
        "grupos": ["medico_oncologista"],
    },
    {
        "email": "oncologista22@teste.com",
        "password": "123456",
        "nome": "Dra. Jessica",
        "cpf": "77777777777",
        "data_nascimento": None,
        "grupos": ["medico_oncologista"],
    },
]


def split_name(nome):
    parts = nome.split()
    return parts[0], " ".join(parts[1:])


def sync_demo_accounts(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Group = apps.get_model("auth", "Group")
    UserProfile = apps.get_model("app", "UserProfile")

    for item in USERS:
        first_name, last_name = split_name(item["nome"])
        user, _ = User.objects.get_or_create(username=item["email"])

        user.email = item["email"]
        user.first_name = first_name
        user.last_name = last_name
        user.is_active = True
        user.is_staff = "admin" in item["grupos"]
        user.is_superuser = "admin" in item["grupos"]
        user.password = make_password(item["password"])
        user.save()

        for group_name in item["grupos"]:
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)

        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "nome": item["nome"],
                "cpf": item["cpf"],
                "data_nascimento": item["data_nascimento"],
                "telefone": "",
                "cartao_sus": "",
                "foto": "",
                "grupos": item["grupos"],
            },
        )
        profile.nome = item["nome"]
        profile.cpf = item["cpf"]
        profile.data_nascimento = item["data_nascimento"]
        profile.grupos = item["grupos"]
        profile.save()


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0004_rename_app_fronten_kind_25fe76_idx_app_fronten_kind_e1809f_idx"),
    ]

    operations = [
        migrations.RunPython(sync_demo_accounts, migrations.RunPython.noop),
    ]
