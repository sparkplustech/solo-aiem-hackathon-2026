"""
Injects deterministic multi-hop mule rings into the transactions database.
"""
import sqlite3
import uuid
import random
from datetime import datetime, timedelta, timezone

DB_PATH = "data/transactions.db"

CITIES = {
    "Mumbai": (19.07, 72.87),
    "Delhi": (28.61, 77.20),
    "Bangalore": (12.97, 77.59),
    "Chennai": (13.08, 80.27),
    "Kolkata": (22.57, 88.36),
    "Hyderabad": (17.38, 78.47),
    "Pune": (18.52, 73.85),
    "Ahmedabad": (23.02, 72.57),
    "Jaipur": (26.91, 75.78),
    "Lucknow": (26.84, 80.94),
}

def inject():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    
    # ── RING 1: Classic Layering Funnel (Jamtara-style) ──
    drain_1 = "drain_jamtara@axl"
    mule_a = "mule_layer_a@ybl"
    mule_b = "mule_layer_b@okicici"
    victims_1 = [f"victim_{i}_ring1@okaxis" for i in range(6)]
    
    for i, v in enumerate(victims_1):
        city = list(CITIES.keys())[i % len(CITIES)]
        lat, lon = CITIES[city]
        ts = (now - timedelta(minutes=random.randint(5, 90))).isoformat()
        target_mule = mule_a if i < 3 else mule_b
        amount = random.randint(800, 4500)
        txn_id = f"mule_r1_{uuid.uuid4().hex[:8]}"
        cursor.execute(
            """INSERT INTO transactions 
            (id, sender_upi, receiver_upi, amount, timestamp, created_at,
             risk_score, risk_level, lat, lon, device_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (txn_id, v, target_mule, amount, ts, ts,
             random.randint(30, 55), "yellow", lat, lon, f"dev_{uuid.uuid4().hex[:6]}")
        )
    
    for mule in [mule_a, mule_b]:
        ts = (now - timedelta(minutes=random.randint(1, 5))).isoformat()
        amount = random.randint(8000, 18000)
        txn_id = f"mule_r1_drain_{uuid.uuid4().hex[:8]}"
        cursor.execute(
            """INSERT INTO transactions 
            (id, sender_upi, receiver_upi, amount, timestamp, created_at,
             risk_score, risk_level, lat, lon, device_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (txn_id, mule, drain_1, amount, ts, ts,
             random.randint(75, 95), "red", 19.07, 72.87, f"dev_{uuid.uuid4().hex[:6]}")
        )
    
    # ── RING 2: OTP Relay Attack Ring ──
    drain_2 = "cashout_otp@paytm"
    relay = "relay_mule_otp@ybl"
    compromised = [f"compromised_{i}_otp@okaxis" for i in range(4)]
    
    for i, c in enumerate(compromised):
        city = list(CITIES.keys())[(i + 3) % len(CITIES)]
        lat, lon = CITIES[city]
        ts = (now - timedelta(minutes=random.randint(10, 60))).isoformat()
        amount = random.randint(5000, 15000)
        txn_id = f"mule_r2_{uuid.uuid4().hex[:8]}"
        cursor.execute(
            """INSERT INTO transactions 
            (id, sender_upi, receiver_upi, amount, timestamp, created_at,
             risk_score, risk_level, lat, lon, device_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (txn_id, c, relay, amount, ts, ts,
             random.randint(50, 70), "yellow", lat, lon, f"new_dev_{uuid.uuid4().hex[:6]}")
        )
    
    ts = (now - timedelta(minutes=2)).isoformat()
    txn_id = f"mule_r2_cashout_{uuid.uuid4().hex[:8]}"
    cursor.execute(
        """INSERT INTO transactions 
        (id, sender_upi, receiver_upi, amount, timestamp, created_at,
         risk_score, risk_level, lat, lon, device_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (txn_id, relay, drain_2, 45000, ts, ts,
         92, "red", 28.61, 77.20, f"new_dev_{uuid.uuid4().hex[:6]}")
    )
    
    conn.commit()
    conn.close()
    print("Injected 2 mule rings (11 transactions) into the database.")
    print("  Ring 1: 6 victims -> 2 mules -> 1 drain (Jamtara-style)")
    print("  Ring 2: 4 compromised -> 1 relay -> 1 cashout (OTP relay)")

if __name__ == "__main__":
    inject()
