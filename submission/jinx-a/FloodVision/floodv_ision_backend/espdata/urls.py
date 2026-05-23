from django.urls import path
from . import views

urlpatterns = [
    # ESP32 posts readings here
    path('reading/', views.receive_reading, name='esp32-receive'),

    # Frontend polls this for the live data stream
    path('latest/', views.latest_readings, name='esp32-latest'),

    # Simple connectivity check
    path('health/', views.health, name='esp32-health'),
]
