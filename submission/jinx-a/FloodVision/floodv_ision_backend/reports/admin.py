from django.contrib import admin
from .models import FloodReport, DrainReport, ReporterProfile, ReportVote


@admin.register(ReporterProfile)
class ReporterProfileAdmin(admin.ModelAdmin):
    list_display = ['reporter_name', 'badge_level', 'total_points', 'total_reports', 'accurate_reports', 'created_at']
    list_filter = ['badge_level']
    search_fields = ['reporter_name']
    ordering = ['-total_points']


@admin.register(FloodReport)
class FloodReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'reporter_name', 'location_name', 'status', 'water_depth_estimate',
                    'validation_score', 'upvotes', 'downvotes', 'points_awarded', 'created_at']
    list_filter = ['status']
    search_fields = ['reporter_name', 'location_name', 'description']
    ordering = ['-created_at']
    readonly_fields = ['upvotes', 'downvotes', 'validation_score', 'gemini_notes', 'points_awarded']


@admin.register(DrainReport)
class DrainReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'reporter_name', 'drain_location', 'status', 'points_awarded', 'created_at']
    list_filter = ['status']
    search_fields = ['reporter_name', 'drain_location']
    ordering = ['-created_at']


@admin.register(ReportVote)
class ReportVoteAdmin(admin.ModelAdmin):
    list_display = ['report', 'voter_id', 'vote', 'created_at']
    list_filter = ['vote']
