from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status


class SoftDeleteModelMixin:
    """
    Sobrescreve o delete padrão do DRF para usar o SoftDelete do BaseModel.
    Em vez de apagar do banco, marca is_deleted=True.
    """

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()  # chama o soft delete do BaseModel
        return Response(
            {"detail": "Registro removido com sucesso."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, *args, **kwargs):
        """
        Endpoint extra para restaurar um registro deletado.
        URL: /api/v1/<recurso>/{id}/restore/
        """
        instance = self.get_object()
        if not instance.is_deleted:
            return Response(
                {"detail": "Este registro não está deletado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.restore()
        return Response(
            {"detail": "Registro restaurado com sucesso."},
            status=status.HTTP_200_OK
        )