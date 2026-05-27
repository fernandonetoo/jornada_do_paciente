from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from app.api.v1.router import router as app_api_router
from app.api.v1.viewsets import (
    BootstrapView,
    ChangePasswordView,
    CollectionView,
    LoginView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/v1/auth/login/', LoginView.as_view(), name='auth_login'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/v1/auth/bootstrap/', BootstrapView.as_view(), name='auth_bootstrap'),
    path('api/v1/auth/profile/', ProfileView.as_view(), name='auth_profile'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path('api/v1/', include(app_api_router.urls)),
    path('api/v1/collections/<str:kind>/', CollectionView.as_view(), name='collections'),

    # Documentação
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
