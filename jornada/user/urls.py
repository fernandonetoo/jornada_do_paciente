from django.urls import path, include
from .api.v1.router import router

urlpatterns = [
    path('', include(router.urls)),
]