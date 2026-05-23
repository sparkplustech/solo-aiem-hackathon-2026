import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_routes = """
@app.post("/api/v1/generate-sar")
async def generate_sar(txn: Dict[str, Any]):
    import time
    time.sleep(1) # mock generation delay
    
    report = f\"\"\"=========================================
SUSPICIOUS ACTIVITY REPORT (SAR)
FIU-IND COMPLIANT GENERATED FORM
=========================================

1. TRANSACTION DETAILS
ID: {txn.get('transaction_id')}
Timestamp: {txn.get('timestamp')}
Sender: {txn.get('sender_upi')}
Receiver: {txn.get('receiver_upi')}
Amount: Rs. {txn.get('amount')}

2. RISK ASSESSMENT
Risk Score: {txn.get('risk_score')} / 100
Risk Level: {txn.get('risk_level')}

3. NARRATIVE (SHAP Explainability)
{txn.get('explanation')}

4. KEY INDICATORS
\"\"\"
    for feat in txn.get('top_shap_features', []):
        report += f"- {feat['feature']}: +{feat['contribution']}\\n"

    report += "\\n========================================="
    return {"report": report}

@app.post("/api/v1/analyst")
async def ai_analyst(payload: Dict[str, Any]):
    query = payload.get("query", "").lower()
    import time
    time.sleep(1) # mock llm thinking
    
    if "mumbai" in query or "city" in query:
        return {
            "reply": "Here are the top 5 high-risk transactions originating from Mumbai today. I've also plotted their volumes.",
            "sql": "SELECT * FROM transactions WHERE lat BETWEEN 18.9 AND 19.2 AND risk_level IN ('red', 'yellow') ORDER BY amount DESC LIMIT 5",
            "chartData": [
                {"label": "Txn 1", "value": 80},
                {"label": "Txn 2", "value": 65},
                {"label": "Txn 3", "value": 45},
                {"label": "Txn 4", "value": 30},
                {"label": "Txn 5", "value": 20}
            ]
        }
    elif "latency" in query:
        return {
            "reply": "The LightGBM model is currently averaging a processing latency of 37ms per transaction, which is well below our 50ms SLA.",
            "sql": None,
            "chartData": None
        }
    else:
        return {
            "reply": "Based on the database analysis, I've found 14 instances matching your criteria. Let me know if you want to export this.",
            "sql": "SELECT * FROM transactions WHERE risk_score > 80 ORDER BY created_at DESC LIMIT 14",
            "chartData": [
                {"label": "Category A", "value": 40},
                {"label": "Category B", "value": 60},
                {"label": "Category C", "value": 25}
            ]
        }
"""

content = content.replace("@app.websocket(", new_routes + "\n@app.websocket(")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
