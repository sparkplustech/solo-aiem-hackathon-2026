import json
import logging
from datetime import datetime, timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone as django_tz

from .models import SensorReading

logger = logging.getLogger(__name__)

# ─── Flood detection threshold ────────────────────────────────────────────────
# HC-SR04 measures the distance from the sensor down to the water surface.
# A SMALL distance = water level is HIGH (close to sensor) = flood risk.
# Adjust this value to match your physical sensor mounting height.
FLOOD_THRESHOLD_CM = 3.5 # if distance < 30 cm → flood alert

# ─── In-memory rolling buffer (last 60 readings ≈ 1 minute) ──────────────────
# This allows the frontend to get a quick response without a DB query on every poll.
_reading_buffer: list[dict] = []
BUFFER_SIZE = 60


def _add_to_buffer(reading: SensorReading) -> None:
    """Append a new reading dict to the rolling in-memory buffer."""
    global _reading_buffer
    entry = {
        "id": reading.pk,
        "timestamp": reading.timestamp.strftime("%H:%M:%S"),
        "distance_cm": reading.distance_cm,
        "is_flood_alert": reading.is_flood_alert,
    }
    _reading_buffer.insert(0, entry)          # newest first
    _reading_buffer = _reading_buffer[:BUFFER_SIZE]


# ─── Endpoint 1: ESP32 → Django (POST) ────────────────────────────────────────
@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def receive_reading(request):
    """
    Receive a distance reading from the ESP32 over HTTP POST.

    Expected JSON body:
        {"distance_cm": 42.5}

    Returns:
        {"status": "ok", "flood_alert": false}
    """
    # Handle CORS pre-flight
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    try:
        body = json.loads(request.body)
        distance_cm = float(body["distance_cm"])
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("ESP32: bad payload — %s", exc)
        return JsonResponse({"status": "error", "detail": str(exc)}, status=400)

    # Detect flood condition
    is_flood = distance_cm < FLOOD_THRESHOLD_CM

    # Persist to DB
    reading = SensorReading.objects.create(
        distance_cm=distance_cm,
        is_flood_alert=is_flood,
    )

    # Keep rolling buffer up to date
    _add_to_buffer(reading)

    if is_flood:
        logger.warning(
            "🚨 FLOOD ALERT — Distance %.1f cm (threshold: %.1f cm)",
            distance_cm, FLOOD_THRESHOLD_CM
        )

    response = JsonResponse({
        "status": "ok",
        "flood_alert": is_flood,
        "distance_cm": distance_cm,
        "reading_id": reading.pk,
    })
    response["Access-Control-Allow-Origin"] = "*"
    return response


# ─── Endpoint 2: Frontend → Django (GET) ──────────────────────────────────────
@require_http_methods(["GET"])
def latest_readings(request):
    """
    Return the rolling buffer of the last N readings for the frontend to display.

    Query params:
        ?n=60   (default 60, max 60)

    Returns:
        {
            "status": "connected" | "no_data",
            "flood_alert": bool,        # true if the LATEST reading is a flood alert
            "latest": { ... } | null,
            "readings": [ ... ],        # newest first
            "total_stored": int,
        }
    """
    try:
        n = min(int(request.GET.get("n", 60)), BUFFER_SIZE)
    except ValueError:
        n = BUFFER_SIZE

    readings_slice = _reading_buffer[:n]
    latest = readings_slice[0] if readings_slice else None

    response = JsonResponse({
        "status": "connected" if readings_slice else "no_data",
        "flood_alert": latest["is_flood_alert"] if latest else False,
        "latest": latest,
        "readings": readings_slice,
        "total_stored": SensorReading.objects.count(),
    })
    response["Access-Control-Allow-Origin"] = "*"
    return response


# ─── Endpoint 3: Health-check (GET) ───────────────────────────────────────────
@require_http_methods(["GET"])
def health(request):
    """Simple liveness check so the frontend can test connectivity."""
    response = JsonResponse({"status": "ok", "service": "espdata"})
    response["Access-Control-Allow-Origin"] = "*"
    return response
