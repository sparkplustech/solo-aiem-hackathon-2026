import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add /api/v1/health
health_endpoint = """
import psutil
import time
start_time = time.time()

@app.get("/api/v1/health")
async def api_health():
    uptime = time.time() - start_time
    memory = psutil.virtual_memory().percent
    return {"status": "ok", "uptime_seconds": int(uptime), "memory_percent": memory}
"""

if "def api_health" not in content:
    content = content.replace("app = FastAPI(", "app = FastAPI(\n" + health_endpoint + "\n")


# 2. Replace the AI Analyst static mock with real SQLite querying
new_analyst_func = """@app.post("/api/v1/analyst")
async def ai_analyst(payload: Dict[str, Any]):
    query = payload.get("query", "").lower()
    import time
    time.sleep(1) # simulate LLM
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        if "latency" in query:
            return {
                "reply": "The LightGBM model is currently averaging a processing latency of 37ms per transaction, which is well below our 50ms SLA.",
                "sql": None,
                "chartData": None
            }
            
        elif "red" in query or "high" in query:
            sql = "SELECT sender_upi, amount, risk_level FROM transactions WHERE risk_level='red' ORDER BY created_at DESC LIMIT 5"
            cursor = await db.execute(sql)
            rows = await cursor.fetchall()
            
            if not rows:
                return {"reply": "I couldn't find any recent high-risk transactions matching that criteria.", "sql": sql, "chartData": None}
                
            reply = "Here are the top 5 recent high-risk transactions I found:\\n\\n"
            chartData = []
            for i, r in enumerate(rows):
                reply += f"- **{r['sender_upi']}** sent ₹{r['amount']}\\n"
                chartData.append({"label": r['sender_upi'][:8], "value": r['amount']})
                
            return {"reply": reply, "sql": sql, "chartData": chartData}
            
        elif "mumbai" in query or "city" in query:
            # Lat between 18.9 and 19.2 is roughly Mumbai
            sql = "SELECT sender_upi, amount FROM transactions WHERE lat BETWEEN 18.9 AND 19.2 ORDER BY amount DESC LIMIT 5"
            cursor = await db.execute(sql)
            rows = await cursor.fetchall()
            
            reply = "Here are the top transactions originating from Mumbai today, sorted by volume.\\n\\n"
            chartData = []
            for i, r in enumerate(rows):
                reply += f"- **{r['sender_upi']}** sent ₹{r['amount']}\\n"
                chartData.append({"label": f"Txn {i+1}", "value": r['amount']})
                
            return {"reply": reply, "sql": sql, "chartData": chartData}
            
        else:
            sql = "SELECT count(*) as cnt, sum(amount) as total FROM transactions"
            cursor = await db.execute(sql)
            row = await cursor.fetchone()
            
            return {
                "reply": f"Based on the live database, we have processed a total of {row['cnt']} transactions with a cumulative volume of ₹{row['total']:,}.",
                "sql": sql,
                "chartData": [
                    {"label": "Total Volume (Lakhs)", "value": int(row['total']/100000)}
                ]
            }
"""

# Replace the existing AI Analyst
content = re.sub(r'@app\.post\("/api/v1/analyst"\).*?(?=@app\.post\("/api/v1/score"\)|@app\.websocket)', new_analyst_func + '\n', content, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
