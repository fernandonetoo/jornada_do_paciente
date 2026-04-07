# from rest_framework import serializers

# class BaseModelSerializer(serializers.ModelSerializer):
#     """
#     Serializer base que inclui os campos de auditoria do BaseModel.
#     Herde esse serializer nos outros apps.
#     """
#     class Meta:
#         read_only_fields = ['created_at', 'updated_at', 'is_deleted', 'deleted_at']