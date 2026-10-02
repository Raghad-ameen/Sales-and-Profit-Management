from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class StoreProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    store_name = models.CharField(max_length=100, verbose_name="اسم المتجر")
    store_type = models.CharField(max_length=100, verbose_name="نوع النشاط التجاري")
    
    def __str__(self):
        return f"{self.store_name} ({self.user.username})"
    
    class Meta:
        verbose_name = "ملف المتجر"
        verbose_name_plural = "ملفات المتاجر"


class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', verbose_name="المتجر")
    name = models.CharField(max_length=200, verbose_name="اسم المنتج")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر الشراء")
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر البيع")
    stock = models.PositiveBigIntegerField(default=0, verbose_name="الكمية المتوفرة")
    currency = models.CharField(max_length=10, default='YER', verbose_name="العملة")    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    @property
    def profit_margin(self):
        # حساب ربح القطعة الواحدة
        return self.selling_price - self.cost_price

    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    class Meta:
        verbose_name = "منتج"
        verbose_name_plural = "المنتجات"
        ordering = ['-id']


class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales', verbose_name="المنتج")
    quantity = models.PositiveBigIntegerField(verbose_name="الكمية المباعة")
    total_sale_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر المبيعات الكلي", editable=False)
    total_profit = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="الربح الكلي", editable=False)
    currency = models.CharField(max_length=10, editable=False, verbose_name="العملة")
    sale_date = models.DateTimeField(auto_now=True, verbose_name="تاريخ البيع")
    
    def save(self, *args, **kwargs):
        # 1. التأكد من توفر الكمية
        if self.product.stock < self.quantity:
            raise ValidationError(f"الكمية المتاحة فقط هي {self.product.stock}")

        self.total_sale_price = self.quantity * self.product.selling_price
        profit_per_unit = self.product.selling_price - self.product.cost_price
        self.total_profit = profit_per_unit * self.quantity
        
        self.currency = self.product.currency
        self.product.stock -= self.quantity
        self.product.save() 
        
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"بيع {self.quantity} من {self.product.name} - {self.total_sale_price} {self.currency}"
    
    class Meta:
        verbose_name = "عملية بيع"
        verbose_name_plural = "المبيعات"
        ordering = ['-sale_date']


class Supplier(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suppliers', verbose_name="المستخدم", null=True, blank=True)
    name = models.CharField(max_length=255, verbose_name="اسم المورد")
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    category = models.CharField(max_length=255, verbose_name="نوع المنتجات")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "مورد"
        verbose_name_plural = "الموردون"
        ordering = ['-created_at']