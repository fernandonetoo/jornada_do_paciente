from django.contrib import admin
from .models import UnidadeBasicaDeSaude


@admin.register(UnidadeBasicaDeSaude)
class UnidadeBasicaDeSaudeAdmin(admin.ModelAdmin):
    list_display  = ("nome", "cnes", "cidade", "estado", "is_deleted")
    list_filter   = ("estado", "is_deleted")
    search_fields = ("nome", "cnes", "cidade")
    ordering      = ("nome",)

    def get_queryset(self, request):
        
        return self.model.objects.incluindo_deletados()