from django.db import models
from django.utils import timezone


class ReporterProfile(models.Model):
    """Tracks a citizen reporter's stats and badge level."""
    BADGE_CHOICES = [
        ('rookie', 'Rookie'),
        ('reporter', 'Reporter'),
        ('guardian', 'Flood Guardian'),
    ]

    reporter_name = models.CharField(max_length=100, unique=True)
    total_points = models.IntegerField(default=0)
    badge_level = models.CharField(max_length=20, choices=BADGE_CHOICES, default='rookie')
    total_reports = models.IntegerField(default=0)
    accurate_reports = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-total_points']

    def __str__(self):
        return f"{self.reporter_name} [{self.badge_level}] — {self.total_points} pts"

    def recalculate_badge(self):
        """Auto-promote badge based on points."""
        if self.total_points >= 500:
            self.badge_level = 'guardian'
        elif self.total_points >= 100:
            self.badge_level = 'reporter'
        else:
            self.badge_level = 'rookie'
        self.save()


class FloodReport(models.Model):
    """A citizen-submitted flood photo report with Gemini validation."""
    STATUS_CHOICES = [
        ('pending', 'Pending Validation'),
        ('validated', 'Validated Flood'),
        ('rejected', 'Rejected'),
    ]

    reporter_name = models.CharField(max_length=100)
    location_name = models.CharField(max_length=200)
    lat = models.FloatField(default=15.5938)
    lng = models.FloatField(default=73.8035)
    photo = models.ImageField(upload_to='flood_reports/', null=True, blank=True)
    photo_url = models.URLField(max_length=500, blank=True, null=True)  # fallback URL
    water_depth_estimate = models.FloatField(default=0.0, help_text="Estimated water depth in cm")
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    validation_score = models.FloatField(default=0.0, help_text="Gemini confidence 0-1")
    gemini_notes = models.TextField(blank=True, help_text="Gemini Vision analysis notes")
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    points_awarded = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.status}] {self.location_name} by {self.reporter_name} @ {self.created_at:%Y-%m-%d %H:%M}"

    @property
    def net_votes(self):
        return self.upvotes - self.downvotes

    def award_points(self):
        """Award points to the reporter profile when a report is validated."""
        profile, _ = ReporterProfile.objects.get_or_create(reporter_name=self.reporter_name)
        pts = int(self.validation_score * 50) + 10  # 10 base + up to 50 for confidence
        self.points_awarded = pts
        profile.total_points += pts
        profile.total_reports += 1
        if self.status == 'validated':
            profile.accurate_reports += 1
        profile.recalculate_badge()
        self.save()


class ReportVote(models.Model):
    """Tracks individual votes to prevent duplicate voting (by session/IP)."""
    report = models.ForeignKey(FloodReport, on_delete=models.CASCADE, related_name='votes')
    voter_id = models.CharField(max_length=100, help_text="Anonymous voter fingerprint (UUID from frontend)")
    vote = models.CharField(max_length=10, choices=[('up', 'Upvote'), ('down', 'Downvote')])
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('report', 'voter_id')

    def __str__(self):
        return f"{self.voter_id} voted {self.vote} on report {self.report_id}"


class DrainReport(models.Model):
    """A citizen drain adoption / blockage report."""
    STATUS_CHOICES = [
        ('blocked', 'Blocked'),
        ('clear', 'Clear'),
        ('debris', 'Debris Detected'),
        ('adopted', 'Adopted'),
    ]

    reporter_name = models.CharField(max_length=100)
    drain_location = models.CharField(max_length=200)
    lat = models.FloatField(default=15.5938)
    lng = models.FloatField(default=73.8035)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='adopted')
    photo = models.ImageField(upload_to='drain_reports/', null=True, blank=True)
    notes = models.TextField(blank=True)
    points_awarded = models.IntegerField(default=10)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Drain [{self.status}] at {self.drain_location} by {self.reporter_name}"

    def save(self, *args, **kwargs):
        # Auto-award points and update reporter profile
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            profile, _ = ReporterProfile.objects.get_or_create(reporter_name=self.reporter_name)
            pts = 15 if self.status == 'blocked' else 10
            self.points_awarded = pts
            profile.total_points += pts
            profile.total_reports += 1
            profile.recalculate_badge()
            DrainReport.objects.filter(pk=self.pk).update(points_awarded=pts)
