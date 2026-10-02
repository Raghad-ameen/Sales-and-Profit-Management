from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.db.models import Sum, F, Q, Value, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken 
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Product, Sale, Supplier, StoreProfile
from .serializers import (
    ProductSerializer,
    SaleSerializer,
    RegisterSerializer,
    SupplierSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # تجميع إجمالي الدخل باستعلام SQL واحد سريع بدلاً من N+1 queries
        return Product.objects.filter(user=self.request.user).annotate(
            total_revenue=Coalesce(
                Sum('sales__total_sale_price'),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))
            )
        ).order_by('-id')

    def perform_create(self, serializer):
        # يربط المنتج باليوزر الحالي تلقائياً عند الإضافة
        serializer.save(user=self.request.user)


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # يرجع فقط مبيعات المنتجات التابعة لهذا المتجر
        return Sale.objects.filter(product__user=self.request.user).order_by('-sale_date')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # توليد التوكن (Access & Refresh) تلقائياً بعد التسجيل
        refresh = RefreshToken.for_user(user)
        store_profile = getattr(user, 'profile', None)
        store_name = store_profile.store_name if store_profile else user.username
        
        return Response({
            "message": "تم إنشاء الحساب بنجاح",
            "username": user.username,
            "store_name": store_name,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store_profile = getattr(request.user, 'profile', None)
        store_name = store_profile.store_name if store_profile else request.user.username

        # 1. إجمالي الأرباح والمبيعات للمتجر الحالي
        stats = Sale.objects.filter(product__user=request.user).aggregate(
            total_revenue=Sum('total_sale_price'),
            total_profit=Sum('total_profit')
        )

        # 2. المنتجات ذات المخزون المنخفض
        low_stock_queryset = Product.objects.filter(user=request.user, stock__lt=5)
        low_stock_list = [
            {
                "id": p.id,
                "name": p.name,
                "current_stock": p.stock,
                "stock": p.stock,
                "selling_price": p.selling_price,
                "currency": p.currency,
            } for p in low_stock_queryset
        ]
        
        return Response({
            "username": request.user.username,
            "store_name": store_name,
            "total_revenue": stats['total_revenue'] or 0,
            "total_profit": stats['total_profit'] or 0,
            "low_stock_alert": {
                "count": len(low_stock_list),
                "products": low_stock_list 
            },
            "currency": "YER"
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_detailed_report(request):
    # جلب كل منتج مع إجمالي الكمية المباعة منه وإجمالي دخله
    report = Product.objects.filter(user=request.user).annotate(
        total_qty_sold=Sum('sales__quantity'),
        total_revenue_per_product=Sum(F('sales__quantity') * F('selling_price'))
    ).values('name', 'total_qty_sold', 'total_revenue_per_product', 'stock', 'currency')
    
    return Response(report)


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # يعرض الموردين التابعين للمستخدم فقط أو الموردين العموميين
        return Supplier.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # يربط المورد بالمستخدم الحالي
        serializer.save(user=self.request.user)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_pw = request.data.get("old_password")
        new_pw = request.data.get("new_password")
        new_un = request.data.get("new_username")

        # التأكد من كلمة المرور القديمة قبل أي تعديل
        if not old_pw or not check_password(old_pw, user.password):
            return Response(
                {"detail": "كلمة المرور الحالية غير صحيحة."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_un and new_un != user.username:
            if User.objects.filter(username=new_un).exclude(id=user.id).exists():
                return Response(
                    {"detail": "اسم المستخدم الجديد مستخدم بالفعل."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = new_un

        if new_pw:
            if len(new_pw) < 8:
                return Response(
                    {"detail": "كلمة المرور الجديدة يجب أن تكون 8 خانات على الأقل."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(new_pw)
            
        user.save()
        return Response({"detail": "تم تحديث البيانات بنجاح."}, status=status.HTTP_200_OK)