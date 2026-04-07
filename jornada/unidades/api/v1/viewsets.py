from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from unidades.models import UnidadeBasicaDeSaude
from .serializers import UnidadeSerializer
# from core.api.v1.mixins import SoftDeleteModelMixin

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = UnidadeBasicaDeSaude.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [IsAuthenticated]

