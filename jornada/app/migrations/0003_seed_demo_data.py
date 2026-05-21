from django.db import migrations
from django.contrib.auth.hashers import make_password
from django.utils import timezone


USERS = [
    {
        "email": "medico@ubs.com",
        "password": "123456",
        "nome": "Dr. João",
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


def seed(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Group = apps.get_model("auth", "Group")
    UserProfile = apps.get_model("app", "UserProfile")
    FrontendRecord = apps.get_model("app", "FrontendRecord")

    users = {}
    for item in USERS:
        first_name, last_name = split_name(item["nome"])
        user, created = User.objects.get_or_create(
            username=item["email"],
            defaults={
                "email": item["email"],
                "first_name": first_name,
                "last_name": last_name,
                "is_staff": "admin" in item["grupos"],
                "is_superuser": "admin" in item["grupos"],
            },
        )
        if created:
            user.password = make_password(item["password"])
            user.save()
        else:
            changed = False
            if not user.email:
                user.email = item["email"]
                changed = True
            if changed:
                user.save()

        for group_name in item["grupos"]:
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)

        UserProfile.objects.get_or_create(
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
        users[item["email"]] = user

    now = timezone.now()
    medico = users["medico@ubs.com"]

    seed_items = [
        (
            "pacientes",
            "12345678901",
            {
                "id": 1001,
                "nome": "Paciente Teste",
                "idade": "26",
                "cpf": "12345678901",
                "contato": "",
                "endereco": "",
                "suspeita": "Acompanhamento inicial",
                "dataNascimento": "2000-01-01",
                "cartaoSus": "",
                "medico": "Dr. João",
                "criadoEm": now.isoformat(),
            },
        ),
        (
            "pacientes",
            "22222222222",
            {
                "id": 1002,
                "nome": "Maria Encaminhada",
                "idade": "47",
                "cpf": "22222222222",
                "contato": "(83) 99999-0000",
                "endereco": "Rua Central, 100",
                "suspeita": "Consulta oncológica",
                "dataNascimento": "1979-03-10",
                "cartaoSus": "700000000000001",
                "medico": "Dr. João",
                "criadoEm": now.isoformat(),
            },
        ),
        (
            "consulta",
            "22222222222",
            {
                "id": 2001,
                "tipo": "Consulta Oncológica",
                "dataSolicitacao": "2026-05-25",
                "dataRetorno": "2026-06-05",
                "medico": "Dr. Carlos",
                "horario": "14:00",
                "unidade": "UBS Central",
                "observacoes": "Avaliação inicial.",
                "status": "Agendado",
                "pacienteId": "22222222222",
                "nomePaciente": "Maria Encaminhada",
            },
        ),
        (
            "exames",
            "22222222222",
            {
                "id": 3001,
                "tipo": "Hemograma",
                "dataSolicitacao": "2026-05-22",
                "hora": "08:00",
                "status": "Agendado",
                "dataRealizacao": "-",
                "laboratorio": "Laboratório Central",
                "observacoes": "",
                "pacienteId": "22222222222",
                "resultado": "",
                "observacaoResultado": "",
                "medicoResponsavel": "Dr. João",
            },
        ),
        (
            "regulacao",
            "22222222222",
            {
                "id": 4001,
                "tipo": "Oncologia",
                "dataSolicitacao": "2026-05-21",
                "hora": "10:00",
                "status": "Em análise",
                "observacoes": "Encaminhamento para avaliação especializada.",
                "pacienteId": "22222222222",
                "pacienteNome": "Maria Encaminhada",
                "pacienteIdade": "47",
                "medicoEmail": "oncologista@teste.com",
                "medicoNome": "Dr. Carlos",
                "criadoPor": "Dr. João",
                "criadoEm": now.isoformat(),
            },
        ),
    ]

    for kind, patient_cpf, payload in seed_items:
        exists = FrontendRecord.objects.filter(kind=kind, patient_cpf=patient_cpf, payload__id=payload["id"]).exists()
        if not exists:
            FrontendRecord.objects.create(
                kind=kind,
                patient_cpf=patient_cpf,
                payload=payload,
                created_by=medico,
                updated_by=medico,
            )


def unseed(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0002_userprofile_frontendrecord"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
