from django.urls import path
from . import views

urlpatterns = [
    # Flood reports
    path('api/reports/', views.flood_reports_list, name='flood-reports-list'),
    path('api/reports/<int:pk>/', views.flood_report_detail, name='flood-report-detail'),
    path('api/reports/<int:pk>/vote/', views.vote_report, name='vote-report'),

    # Leaderboard
    path('api/leaderboard/', views.leaderboard, name='leaderboard'),

    # Drain adoption
    path('api/drains/', views.drain_reports_list, name='drain-reports-list'),

    # Stats
    path('api/stats/', views.reports_stats, name='reports-stats'),
]
