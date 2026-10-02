from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Sum
from .models import Product, Sale, StoreProfile, Supplier


class ProductSerializer(serializers.ModelSerializer):
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    selling_price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    profit_margin = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, coerce_to_string=False)
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'cost_price', 'selling_price', 'profit_margin', 'stock', 'total_revenue', 'currency'] 

    def get_total_revenue(self, obj):
        # استخدام القيمة المحسوبة مباشرة من الـ QuerySet لتفادي تكرار الاستعلامات والبطء
        if hasattr(obj, 'total_revenue') and obj.total_revenue is not None:
            return obj.total_revenue
        sales_rel = getattr(obj, 'sales', getattr(obj, 'sale_set', None))
        if sales_rel:
            total = sales_rel.aggregate(Sum('total_sale_price'))['total_sale_price__sum']
            return total if total else 0
        return 0


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['total_sale_price', 'total_profit', 'currency', 'sale_date']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("الكمية المباعة يجب أن تكون أكبر من صفر.")
        return value

    def validate(self, attrs):
        product = attrs.get('product')
        quantity = attrs.get('quantity')
        request = self.context.get('request')

        if product and request and product.user != request.user:
            raise serializers.ValidationError({"product": "غير مصرح لك بتسجيل بيع لمنتج لا ينتمي لمتجرك."})

        if product and quantity and product.stock < quantity:
            raise serializers.ValidationError({"quantity": f"الكمية المتاحة في المخزون هي {product.stock} فقط."})

        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(write_only=True, max_length=100)
    store_type = serializers.CharField(write_only=True, max_length=100)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'password', 'store_name', 'store_type']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("اسم المستخدم مسجل مسبقاً، اختر اسماً آخر.")
        return value

    def create(self, validated_data):
        # 1. إنشاء المستخدم وتشفير كلمة المرور
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        # 2. إنشاء بروفايل المتجر المرتبط به
        StoreProfile.objects.create(
            user=user,
            store_name=validated_data['store_name'],
            store_type=validated_data['store_type']
        )
        return user


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'phone', 'category', 'created_at']
        read_only_fields = ['id', 'created_at']
