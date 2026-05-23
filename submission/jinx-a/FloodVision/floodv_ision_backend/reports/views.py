import logging
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import FloodReport, DrainReport, ReporterProfile, ReportVote
from .serializers import (
    FloodReportSerializer, FloodReportCreateSerializer,
    DrainReportSerializer, ReporterProfileSerializer, VoteSerializer
)

logger = logging.getLogger('reports')

# ─── Flood Reports ────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def flood_reports_list(request):
    """
    GET  /reports/api/reports/   → list all reports, newest first
    POST /reports/api/reports/   → submit a new flood report
    """
    if request.method == 'GET':
        limit = int(request.query_params.get('limit', 50))
        reports = FloodReport.objects.all().order_by('-created_at')[:limit]
        serializer = FloodReportSerializer(reports, many=True, context={'request': request})
        return Response({
            'count': FloodReport.objects.count(),
            'results': serializer.data
        })

    # POST — create new report
    create_ser = FloodReportCreateSerializer(data=request.data)
    if not create_ser.is_valid():
        return Response(create_ser.errors, status=status.HTTP_400_BAD_REQUEST)

    report = create_ser.save()

    # Auto-validate with a simple heuristic (Gemini hook point)
    # In production, call Gemini Vision API here. For now, auto-approve with
    # a high confidence so the system works end-to-end without an API key.
    depth = report.water_depth_estimate or 0
    if depth > 5:
        confidence = min(0.95, 0.6 + (depth / 200))
        report.status = 'validated'
        report.validation_score = round(confidence, 2)
        report.gemini_notes = (
            f"Auto-validated: water depth estimate {depth:.1f}cm "
            f"indicates probable flood event. Confidence: {confidence:.0%}."
        )
    else:
        report.status = 'pending'
        report.validation_score = 0.3
        report.gemini_notes = "Pending manual review — depth estimate below flood threshold."

    report.save()

    # Award points
    if report.status == 'validated':
        report.award_points()

    # Ensure reporter profile exists
    ReporterProfile.objects.get_or_create(reporter_name=report.reporter_name)

    out = FloodReportSerializer(report, context={'request': request})
    logger.info("New flood report #%s from %s at %s", report.id, report.reporter_name, report.location_name)
    return Response(out.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def flood_report_detail(request, pk):
    """GET /reports/api/reports/<pk>/"""
    try:
        report = FloodReport.objects.get(pk=pk)
    except FloodReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = FloodReportSerializer(report, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def vote_report(request, pk):
    """
    POST /reports/api/reports/<pk>/vote/
    Body: { "voter_id": "<uuid>", "vote": "up" | "down" }
    """
    try:
        report = FloodReport.objects.get(pk=pk)
    except FloodReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

    ser = VoteSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    voter_id = ser.validated_data['voter_id']
    vote_val = ser.validated_data['vote']

    try:
        vote_obj = ReportVote.objects.create(
            report=report,
            voter_id=voter_id,
            vote=vote_val
        )
    except IntegrityError:
        # Already voted — allow changing vote
        vote_obj = ReportVote.objects.get(report=report, voter_id=voter_id)
        old_vote = vote_obj.vote
        if old_vote == vote_val:
            return Response({'detail': 'Already voted', 'upvotes': report.upvotes, 'downvotes': report.downvotes})
        # Reverse old vote
        if old_vote == 'up':
            report.upvotes = max(0, report.upvotes - 1)
        else:
            report.downvotes = max(0, report.downvotes - 1)
        vote_obj.vote = vote_val
        vote_obj.save()

    if vote_val == 'up':
        report.upvotes += 1
    else:
        report.downvotes += 1
    report.save()

    return Response({
        'detail': 'Vote recorded',
        'upvotes': report.upvotes,
        'downvotes': report.downvotes,
        'net_votes': report.net_votes
    })


# ─── Leaderboard ─────────────────────────────────────────────────────────────

@api_view(['GET'])
def leaderboard(request):
    """GET /reports/api/leaderboard/ — top reporters by points."""
    limit = int(request.query_params.get('limit', 20))
    profiles = ReporterProfile.objects.order_by('-total_points')[:limit]
    serializer = ReporterProfileSerializer(profiles, many=True)
    return Response({
        'count': ReporterProfile.objects.count(),
        'results': serializer.data
    })


# ─── Drain Reports ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def drain_reports_list(request):
    """
    GET  /reports/api/drains/  → list drain reports
    POST /reports/api/drains/  → adopt drain / report blockage
    """
    if request.method == 'GET':
        limit = int(request.query_params.get('limit', 50))
        drains = DrainReport.objects.all().order_by('-created_at')[:limit]
        serializer = DrainReportSerializer(drains, many=True)
        return Response({
            'count': DrainReport.objects.count(),
            'results': serializer.data
        })

    ser = DrainReportSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    drain = ser.save()
    logger.info("Drain report #%s by %s at %s", drain.id, drain.reporter_name, drain.drain_location)

    # Return updated with points awarded
    out = DrainReportSerializer(DrainReport.objects.get(pk=drain.pk))
    return Response(out.data, status=status.HTTP_201_CREATED)


# ─── Stats summary ───────────────────────────────────────────────────────────

@api_view(['GET'])
def reports_stats(request):
    """GET /reports/api/stats/ — quick summary numbers for dashboard widget."""
    return Response({
        'total_flood_reports': FloodReport.objects.count(),
        'validated_reports': FloodReport.objects.filter(status='validated').count(),
        'pending_reports': FloodReport.objects.filter(status='pending').count(),
        'total_drain_reports': DrainReport.objects.count(),
        'total_reporters': ReporterProfile.objects.count(),
        'guardians': ReporterProfile.objects.filter(badge_level='guardian').count(),
    })
