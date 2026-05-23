"""Quick smoke test for all critical API endpoints."""
import urllib.request
import json
import time

BASE = "http://localhost:8000"

def test(name, url, method="GET", body=None):
    try:
        if body:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method=method)
        else:
            req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        print(f"  [OK] {name} -> {str(data)[:120]}")
        return data
    except Exception as e:
        print(f"  [FAIL] {name} -> {e}")
        return None

print("=== DRISHTI API Smoke Test ===\n")

test("Health", f"{BASE}/api/v1/health")
test("Metrics Overview", f"{BASE}/api/v1/metrics/overview")
test("Transactions (REST)", f"{BASE}/api/v1/transactions")
test("Graph (Mule Network)", f"{BASE}/api/v1/graph")
test("Heatmap", f"{BASE}/api/v1/heatmap")
test("Settings", f"{BASE}/api/v1/settings")
test("AI Analyst (general)", f"{BASE}/api/v1/analyst", method="POST", body={"query": "How many transactions?"})
test("AI Analyst (high risk)", f"{BASE}/api/v1/analyst", method="POST", body={"query": "Show me red risk transactions"})
test("Adversarial Score", f"{BASE}/api/v1/score", method="POST", body={
    "transaction_id": "smoke_test_001",
    "sender_upi": "test@upi",
    "receiver_upi": "merchant@ybl",
    "amount": 25000,
    "timestamp": "2026-05-22T21:00:00",
    "device_id": "dev_smoke",
    "lat": 19.07,
    "lon": 72.87,
    "is_new_beneficiary": True,
    "new_device_flag": True,
    "txn_count_1h": 5,
    "amount_avg_1h": 2000
})

print("\n=== Done ===")
