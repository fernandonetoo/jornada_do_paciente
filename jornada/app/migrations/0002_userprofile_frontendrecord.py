# Generated for backend integration.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FrontendRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('kind', models.CharField(choices=[('pacientes', 'Pacientes'), ('consulta', 'Consultas'), ('exames', 'Exames'), ('regulacao', 'Regulação'), ('diagnosticos', 'Diagnósticos')], max_length=20)),
                ('patient_cpf', models.CharField(blank=True, db_index=True, max_length=14)),
                ('payload', models.JSONField(default=dict)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='frontend_records_created', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='frontend_records_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Registro do Frontend',
                'verbose_name_plural': 'Registros do Frontend',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('nome', models.CharField(max_length=150)),
                ('cpf', models.CharField(blank=True, max_length=14, null=True, unique=True)),
                ('data_nascimento', models.DateField(blank=True, null=True)),
                ('telefone', models.CharField(blank=True, max_length=20)),
                ('cartao_sus', models.CharField(blank=True, max_length=20)),
                ('foto', models.TextField(blank=True)),
                ('grupos', models.JSONField(blank=True, default=list)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Perfil de Usuário',
                'verbose_name_plural': 'Perfis de Usuários',
                'ordering': ['nome'],
            },
        ),
        migrations.AddIndex(
            model_name='frontendrecord',
            index=models.Index(fields=['kind', 'patient_cpf'], name='app_fronten_kind_25fe76_idx'),
        ),
    ]
