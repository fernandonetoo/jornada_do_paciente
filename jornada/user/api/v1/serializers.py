from rest_framework import serializers
# from django.contrib.auth.models import User
from user.models import Usuario

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        # model = User
        model = Usuario
        fields = ['id', 'username', 'email', 'get_full_name', 'tipo_usuario', 'first_name', 'last_name']