from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from user.models import Usuario
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
