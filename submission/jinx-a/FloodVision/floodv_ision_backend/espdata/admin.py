from django.contrib import admin
from .models import SensorReading


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'distance_cm', 'is_flood_alert')
    list_filter = ('is_flood_alert',)
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
