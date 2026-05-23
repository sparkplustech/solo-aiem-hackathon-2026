from typing import Any, Dict, List, Tuple
from datetime import datetime

def evaluate_rules(txn: Dict[str, Any], profile: Dict[str, Any], temporal_context: Dict[str, Any]) -> List[str]:
    """
    Evaluate hard-coded fraud rules against the transaction and account profile.
    Returns a list of triggered rule flags.
    """
    flags = []
    
    amount = float(txn.get("amount", 0.0))
    timestamp = txn.get("timestamp", "")
    try:
        dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        hour = dt.hour
    except (ValueError, TypeError, AttributeError):
        hour = 12

    
    # Profile metrics
    txn_count_1h = int(profile.get("txn_count_1h", 0))
    amount_avg_1h = float(profile.get("amount_avg_1h", 0.0))
    amount_sum_1h = float(profile.get("amount_sum_1h", 0.0))
    txn_count_24h = int(profile.get("txn_count_24h", 0))
    is_new_beneficiary = bool(profile.get("is_new_beneficiary", False))
    beneficiary_age_days = float(profile.get("beneficiary_age_days", 999.0))
    new_device_flag = bool(profile.get("new_device_flag", False))
    mcc_mismatch_flag = bool(profile.get("mcc_mismatch_flag", False))
    account_age_days = int(profile.get("account_age_days", 999))
    graph_contagion = float(profile.get("graph_contagion_score", 0.0))
    
    # Temporal multiplier (festivals / salary days)
    multiplier = float(temporal_context.get("threshold_multiplier", 1.0))
    
    # R01: High velocity
    if txn_count_1h > 3 and amount_avg_1h > (1000 * multiplier):
        flags.append("HIGH_VELOCITY")
        
    # R02: Limit proximity (assuming 100k daily limit)
    daily_limit = 100000
    if amount > (0.8 * daily_limit) and is_new_beneficiary:
        flags.append("LIMIT_PROXIMITY")
        
    # R03: Device + Ben combo
    if new_device_flag and is_new_beneficiary and amount > (5000 * multiplier):
        flags.append("DEVICE_BEN_COMBO")
        
    # R04: Night transfer
    if (hour >= 22 or hour <= 5) and amount > (2000 * multiplier):
        flags.append("NIGHT_TRANSFER")
        
    # R05: New Ben + High Amount
    if beneficiary_age_days < 0.02 and amount > (3000 * multiplier): # roughly < 30 mins
        flags.append("NEW_BEN_HIGH_AMOUNT")
        
    # R06: Merchant mismatch
    if mcc_mismatch_flag and amount > 1000:
        flags.append("MERCHANT_MISMATCH")
        
    # R07: New account high amount
    if account_age_days < 7 and amount > (2000 * multiplier):
        flags.append("NEW_ACCOUNT_HIGH")
        
    # R08: High txn count 24h
    if txn_count_24h > 10:
        flags.append("HIGH_TXN_COUNT")
        
    # R09: High amount 1h
    if amount_sum_1h + amount > (10000 * multiplier):
        flags.append("HIGH_AMOUNT_1H")
        
    # R10: Graph contagion
    if graph_contagion > 0.7:
        flags.append("GRAPH_CONTAGION")
        
    return flags
