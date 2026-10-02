"""
URL configuration for shops project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from stores.views import (
    ProductViewSet,
    SaleViewSet,
    SupplierViewSet,
    RegisterView,
    DashboardStatsView,
    ChangePasswordView,
    sales_detailed_report,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'suppliers', SupplierViewSet, basename='supplier')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/dashboard/', DashboardStatsView.as_view(), name='dashboard'), 
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/reports/detailed/', sales_detailed_report, name='sales-detailed-report'),
]
