from django.db import models


class SensorReading(models.Model):
    """
    Stores each distance reading received from the ESP32 HC-SR04 sensor.
    A reading is flagged as a flood alert if the distance is below the threshold.
    """
    distance_cm = models.FloatField(help_text="Distance measured by HC-SR04 in centimetres")
    is_flood_alert = models.BooleanField(default=False, help_text="True when distance < FLOOD_THRESHOLD_CM")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Sensor Reading'
        verbose_name_plural = 'Sensor Readings'

    def __str__(self):
        return f"{self.timestamp:%H:%M:%S} | {self.distance_cm:.1f} cm {'⚠ FLOOD' if self.is_flood_alert else ''}"
