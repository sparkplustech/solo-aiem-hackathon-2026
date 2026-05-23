from typing import Dict, Any
from datetime import datetime

FESTIVAL_DATES = {
    "10-20": "Diwali", "10-21": "Diwali", "10-22": "Diwali",
    "11-01": "Bhai Dooj", "08-15": "Independence Day", "01-26": "Republic Day",
    "03-14": "Holi", "04-14": "Baisakhi", "09-05": "Ganesh Chaturthi",
    "10-02": "Gandhi Jayanti", "12-25": "Christmas", "12-31": "New Year Eve"
}

SALARY_DAYS = {1, 5, 10, 15, 25, 28, 30, 31}

def get_temporal_context(timestamp_str: str) -> Dict[str, Any]:
    try:
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime.now()
        
    date_key = dt.strftime("%m-%d")
    day = dt.day
    
    is_festival = date_key in FESTIVAL_DATES
    festival_name = FESTIVAL_DATES.get(date_key)
    is_salary = day in SALARY_DAYS
    
    multiplier = 1.0
    if is_festival:
        multiplier = 1.5
    elif is_salary:
        multiplier = 1.2
        
    return {
        "is_festival_day": is_festival,
        "festival_name": festival_name,
        "is_salary_day": is_salary,
        "threshold_multiplier": multiplier
    }
