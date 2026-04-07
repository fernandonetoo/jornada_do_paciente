from rest_framework import serializers
from unidades.models import UnidadeBasicaDeSaude

class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadeBasicaDeSaude
        fields = ['id', 'nome', 'cnes', 'cidade', 'estado', 'endereco']