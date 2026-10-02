from django.contrib import admin
from .models import StoreProfile, Product, Sale, Supplier


@admin.register(StoreProfile)
class StoreProfileAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'user', 'store_type')
    search_fields = ('store_name', 'user__username', 'store_type')
    list_filter = ('store_type',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'cost_price', 'selling_price', 'stock', 'currency', 'profit_margin')
    search_fields = ('name', 'user__username')
    list_filter = ('currency', 'user')
    list_editable = ('stock', 'selling_price')


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'total_sale_price', 'total_profit', 'currency', 'sale_date')
    search_fields = ('product__name', 'product__user__username')
    list_filter = ('currency', 'sale_date')
    readonly_fields = ('total_sale_price', 'total_profit', 'currency', 'sale_date')


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'category', 'user', 'created_at')
    search_fields = ('name', 'phone', 'category', 'user__username')
    list_filter = ('category', 'created_at')
