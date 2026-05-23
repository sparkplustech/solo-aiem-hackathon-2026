from rest_framework import serializers
from .models import FloodReport, DrainReport, ReporterProfile, ReportVote


class ReporterProfileSerializer(serializers.ModelSerializer):
    accuracy_pct = serializers.SerializerMethodField()

    class Meta:
        model = ReporterProfile
        fields = [
            'id', 'reporter_name', 'total_points', 'badge_level',
            'total_reports', 'accurate_reports', 'accuracy_pct', 'created_at'
        ]

    def get_accuracy_pct(self, obj):
        if obj.total_reports == 0:
            return 0
        return round((obj.accurate_reports / obj.total_reports) * 100, 1)


class FloodReportSerializer(serializers.ModelSerializer):
    net_votes = serializers.ReadOnlyField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = FloodReport
        fields = [
            'id', 'reporter_name', 'location_name', 'lat', 'lng',
            'photo_url', 'water_depth_estimate', 'description',
            'status', 'validation_score', 'gemini_notes',
            'upvotes', 'downvotes', 'net_votes', 'points_awarded', 'created_at'
        ]
        read_only_fields = [
            'status', 'validation_score', 'gemini_notes',
            'upvotes', 'downvotes', 'points_awarded'
        ]

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo_url or None


class FloodReportCreateSerializer(serializers.ModelSerializer):
    """Used for POST — accepts photo upload."""
    class Meta:
        model = FloodReport
        fields = [
            'reporter_name', 'location_name', 'lat', 'lng',
            'photo', 'photo_url', 'water_depth_estimate', 'description'
        ]


class VoteSerializer(serializers.Serializer):
    voter_id = serializers.CharField(max_length=100)
    vote = serializers.ChoiceField(choices=['up', 'down'])


class DrainReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrainReport
        fields = [
            'id', 'reporter_name', 'drain_location', 'lat', 'lng',
            'status', 'notes', 'points_awarded', 'created_at'
        ]
        read_only_fields = ['points_awarded']
