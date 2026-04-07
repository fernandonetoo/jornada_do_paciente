from django.db import models
from core.models import BaseModel


class UnidadeBasicaDeSaude(BaseModel):  
    nome = models.CharField(max_length=255)
    cnes = models.CharField(max_length=7, unique=True)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    endereco = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name  = "Unidade Básica de Saúde"
        verbose_name_plural = "Unidades Básicas de Saúde"
        ordering  = ["nome"]

    def __str__(self):
        return f"{self.nome} — {self.cidade}/{self.estado}"