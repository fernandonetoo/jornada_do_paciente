from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import Medico, Paciente

# Quando um novo médico for criado, adiciona o usuário ao grupo correspondente
@receiver(post_save, sender=Medico)
def adicionar_grupo_ao_medico(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance.user

    if instance.tipo == Medico.Tipo.ubs:
        grupo, _ = Group.objects.get_or_create(name='Médico UBS')
        user.groups.add(grupo)
    elif instance.tipo == Medico.Tipo.oncologista:
        grupo, _ = Group.objects.get_or_create(name='oncologista')
        user.groups.add(grupo)

# Verifica se o estado realmente mudou antes de chamar o save e sincroniza a inativação do médico com o usuário e o CRM.
@receiver(post_save, sender=Medico)
def sincronizar_inativacao_medico(sender, instance, created, **kwargs):
    if created:
        return

    user = instance.user
    crm = instance.crm

    if instance.is_deleted:
        # Inativa apenas se estiver ativo
        if user.is_active:
            user.is_active = False
            user.save(update_fields=['is_active'])
        
        if not crm.is_deleted:
            crm.is_deleted = True
            crm.deleted_at = instance.deleted_at
            crm.save(update_fields=['is_deleted', 'deleted_at'])
    else:
        # Reativa apenas se estiver inativo
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])
            
        if crm.is_deleted:
            crm.is_deleted = False
            crm.deleted_at = None
            crm.save(update_fields=['is_deleted', 'deleted_at'])


@receiver(post_save, sender=Paciente)
def adicionar_grupo_ao_paciente(sender, instance, created, **kwargs):
    if not created:
        return

    grupo, _ = Group.objects.get_or_create(name='paciente')
    instance.user.groups.add(grupo)


@receiver(post_save, sender=Paciente)
def sincronizar_inativacao_paciente(sender, instance, created, **kwargs):
    if created:
        return

    user = instance.user

    if instance.is_deleted:
        if user.is_active:
            user.is_active = False
            user.save(update_fields=['is_active'])
    else:
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])