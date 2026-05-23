import re

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add timedelta import if missing
if "from datetime import datetime, timedelta" not in content:
    content = content.replace("from datetime import datetime", "from datetime import datetime, timedelta")

# Define the new process_transaction function
new_process_func = """async def process_transaction(txn: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.perf_counter()
    
    sender = txn["sender_upi"]
    receiver = txn["receiver_upi"]
    amount = float(txn["amount"])
    timestamp_str = txn["timestamp"]
    device_id = txn.get("device_id")
    
    # Context
    t_context = temporal.get_temporal_context(timestamp_str)
    if GLOBAL_SETTINGS.get("festival_mode", False):
        t_context["is_festival_day"] = True
        t_context["festival_name"] = "Simulated Festival"
        t_context["threshold_multiplier"] = 1.5
    
    # Parse timestamp
    try:
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime.now()
        
    hour = dt.hour
    day_of_week = dt.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    is_night = 1 if (hour >= 22 or hour <= 5) else 0
    
    dt_1h_ago = (dt - timedelta(hours=1)).isoformat()
    dt_24h_ago = (dt - timedelta(hours=24)).isoformat()
    dt_7d_ago = (dt - timedelta(days=7)).isoformat()
    dt_str = dt.isoformat()

    # Query DB
    async with aiosqlite.connect(DB_PATH) as db:
        # Sender 1h stats
        cursor = await db.execute("SELECT COUNT(*) FROM transactions WHERE sender_upi=? AND timestamp >= ? AND timestamp < ?", (sender, dt_1h_ago, dt_str))
        txn_count_1h = (await cursor.fetchone())[0] or 0
        
        # Sender 24h stats
        cursor = await db.execute("SELECT COUNT(*) FROM transactions WHERE sender_upi=? AND timestamp >= ? AND timestamp < ?", (sender, dt_24h_ago, dt_str))
        txn_count_24h = (await cursor.fetchone())[0] or 0
        
        # Sender 7d avg amount
        cursor = await db.execute("SELECT AVG(amount) FROM transactions WHERE sender_upi=? AND timestamp >= ? AND timestamp < ?", (sender, dt_7d_ago, dt_str))
        amount_avg_7d = (await cursor.fetchone())[0]
        
        # Account age (first seen sender)
        cursor = await db.execute("SELECT timestamp FROM transactions WHERE sender_upi=? ORDER BY timestamp ASC LIMIT 1", (sender,))
        first_sender_row = await cursor.fetchone()
        if first_sender_row:
            first_dt = datetime.fromisoformat(first_sender_row[0].replace("Z", "+00:00"))
            account_age_days = int((dt - first_dt).total_seconds() / 86400)
        else:
            account_age_days = 0 # New account
            
        # Beneficiary age & new beneficiary flag
        cursor = await db.execute("SELECT timestamp FROM transactions WHERE sender_upi=? AND receiver_upi=? AND timestamp < ? ORDER BY timestamp ASC LIMIT 1", (sender, receiver, dt_str))
        first_ben_row = await cursor.fetchone()
        if first_ben_row:
            is_new_beneficiary = 0
            first_ben_dt = datetime.fromisoformat(first_ben_row[0].replace("Z", "+00:00"))
            beneficiary_age_days = round((dt - first_ben_dt).total_seconds() / 86400, 2)
        else:
            is_new_beneficiary = 1
            beneficiary_age_days = 0.0
            
        # New device flag
        if device_id:
            cursor = await db.execute("SELECT 1 FROM transactions WHERE sender_upi=? AND device_id=? AND timestamp < ? LIMIT 1", (sender, device_id, dt_str))
            has_seen_device = await cursor.fetchone()
            new_device_flag = 0 if has_seen_device else 1
        else:
            new_device_flag = 0
            
    # Apply overrides (for adversarial simulator)
    if txn.get("txn_count_1h") is not None: txn_count_1h = int(txn["txn_count_1h"])
    if txn.get("amount_avg_1h") is not None: amount_avg_7d = float(txn["amount_avg_1h"])
    if txn.get("is_new_beneficiary") is not None: is_new_beneficiary = 1 if txn["is_new_beneficiary"] else 0
    if txn.get("new_device_flag") is not None: new_device_flag = 1 if txn["new_device_flag"] else 0

    # Fallbacks for empty history
    cohort_name = get_user_cohort(sender)
    cohort = ONBOARDING_COHORTS[cohort_name]
    if amount_avg_7d is None:
        amount_avg_7d = cohort["amount_avg_1h_baseline"] * random.uniform(0.8, 1.2)
        
    amount_vs_7d_avg = round(amount / (amount_avg_7d + 1), 2)
    is_merchant_vpa = 1 if "merchant" in receiver.lower() or "store" in receiver.lower() or receiver.endswith("@ybl") else 0
    
    # Graph contagion and metrics (Real-time Louvain subgraph)
    graph_contagion_score = 0.0
    fan_in_count_1h = 0
    drain_ratio_24h = 0.0
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT sender_upi, receiver_upi, amount FROM transactions ORDER BY created_at DESC LIMIT 500")
            recent_rows = await cursor.fetchall()
            
        txns_graph = [{"sender_upi": r["sender_upi"], "receiver_upi": r["receiver_upi"], "amount": r["amount"]} for r in recent_rows]
        txns_graph.append({"sender_upi": sender, "receiver_upi": receiver, "amount": amount})
        G, metrics_map, mule_rings = graph.build_and_analyze_graph(txns_graph)
        
        receiver_metrics = metrics_map.get(receiver, {})
        fan_in_count_1h = receiver_metrics.get("fan_in_count_1h", 0)
        drain_ratio_24h = receiver_metrics.get("drain_ratio_24h", 0.0)
        if receiver_metrics.get("mule_suspect", False):
            graph_contagion_score = 0.85
        elif receiver_metrics.get("betweenness_centrality", 0) > 0.05:
            graph_contagion_score = 0.4
    except Exception as e:
        logger.error(f"Graph analytics error: {e}")
        pass

    is_festival_day = 1 if t_context.get("is_festival_day", False) else 0
    is_salary_day = 1 if t_context.get("is_salary_day", False) else 0
    city_tier = 1
    
    import math
    amount_log = round(math.log1p(amount), 4)
    velocity_score = round(txn_count_1h * (amount / 1000.0), 2)
    
    risk_combo = 1 if (new_device_flag and is_new_beneficiary and amount > 5000) else 0
    type_encoded = 1
    
    features = {
        "amount": amount,
        "hour": hour,
        "is_night": is_night,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "new_device_flag": new_device_flag,
        "is_new_beneficiary": is_new_beneficiary,
        "txn_count_1h": txn_count_1h,
        "txn_count_24h": txn_count_24h,
        "amount_avg_7d": amount_avg_7d,
        "amount_vs_7d_avg": amount_vs_7d_avg,
        "beneficiary_age_days": beneficiary_age_days,
        "account_age_days": account_age_days,
        "is_merchant_vpa": is_merchant_vpa,
        "graph_contagion_score": graph_contagion_score,
        "fan_in_count_1h": fan_in_count_1h,
        "drain_ratio_24h": drain_ratio_24h,
        "is_festival_day": is_festival_day,
        "is_salary_day": is_salary_day,
        "city_tier": city_tier,
        "amount_log": amount_log,
        "velocity_score": velocity_score,
        "risk_combo": risk_combo,
        "type_encoded": type_encoded
    }
    
    profile_for_rules = {
        "txn_count_1h": txn_count_1h,
        "amount_avg_1h": amount_avg_7d,
        "amount_sum_1h": txn_count_1h * amount_avg_7d,
        "txn_count_24h": txn_count_24h,
        "is_new_beneficiary": bool(is_new_beneficiary),
        "beneficiary_age_days": beneficiary_age_days,
        "new_device_flag": bool(new_device_flag),
        "account_age_days": account_age_days,
        "graph_contagion_score": graph_contagion_score
    }
    
    # 1. Rule Engine
    rule_flags = rules.evaluate_rules(txn, profile_for_rules, t_context)
    
    # 2. ML Scorer
    r_score, r_level, top_shap = scorer.score_transaction(features)
    
    if "DEVICE_BEN_COMBO" in rule_flags:
        r_score = max(r_score, 90)
        r_level = "red"
        
    latency = int((time.perf_counter() - start_time) * 1000)
    
    resp = {
        "transaction_id": txn["transaction_id"],
        "risk_score": r_score,
        "risk_level": r_level,
        "rule_flags": rule_flags,
        "top_shap_features": top_shap,
        "explanation_status": "generating",
        "latency_ms": latency,
        "amount": amount,
        "sender_upi": sender,
        "receiver_upi": receiver,
        "timestamp": timestamp_str,
        "cohort": get_user_cohort(sender)
    }
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO transactions (id, sender_upi, receiver_upi, amount, timestamp, device_id, lat, lon, risk_score, risk_level, rule_flags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (txn["transaction_id"], sender, receiver, amount, timestamp_str, device_id, txn.get("lat"), txn.get("lon"), r_score, r_level, json.dumps(rule_flags))
        )
        await db.execute(
            "INSERT OR REPLACE INTO transaction_features (id, features_json) VALUES (?, ?)",
            (txn["transaction_id"], json.dumps(features))
        )
        await db.commit()
        
    if r_level in ["yellow", "red"]:
        asyncio.create_task(generate_and_broadcast_explanation(txn["transaction_id"], txn, top_shap))
    else:
        resp["explanation_status"] = "none"
        
    return resp"""

# Use regex to replace the old process_transaction function
pattern = re.compile(r"async def process_transaction.*?return resp", re.DOTALL)
new_content = pattern.sub(new_process_func, content)

with open("main.py", "w", encoding="utf-8") as f:
    f.write(new_content)
