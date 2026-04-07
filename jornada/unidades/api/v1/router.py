from rest_framework.routers import DefaultRouter
from .viewsets import UnidadeViewSet

router = DefaultRouter()
router.register(r'', UnidadeViewSet, basename='unidade')