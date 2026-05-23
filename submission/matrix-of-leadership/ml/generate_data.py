"""
DRISHTI ML Pipeline — PaySim-inspired Training Data Generator
Generates realistic transaction data modeled after the PaySim dataset structure
with UPI-specific feature engineering layered on top.
"""
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta

np.random.seed(42)

N_LEGIT = 50000
N_FRAUD = 5000
TOTAL = N_LEGIT + N_FRAUD

print(f"Generating PaySim-inspired dataset: {N_LEGIT} legit + {N_FRAUD} fraud = {TOTAL} total")

# --- PaySim-style transaction types ---
TXN_TYPES = ["PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"]
TXN_TYPE_FRAUD_WEIGHTS = {
    "PAYMENT": 0.02, "TRANSFER": 0.15, "CASH_OUT": 0.25, "DEBIT": 0.05, "CASH_IN": 0.01
}

# --- Generate legitimate transactions ---
legit = pd.DataFrame()
legit["type"] = np.random.choice(TXN_TYPES, N_LEGIT, p=[0.40, 0.25, 0.15, 0.15, 0.05])
legit["amount"] = np.abs(np.concatenate([
    np.random.lognormal(mean=6.5, sigma=1.2, size=N_LEGIT // 2),   # Small txns
    np.random.lognormal(mean=8.0, sigma=0.8, size=N_LEGIT // 2),   # Medium txns
]))[:N_LEGIT]
legit["amount"] = np.clip(legit["amount"], 10, 200000).round(2)

# Temporal: mostly daytime, weekdays
legit_hour_probs = np.array([0.01,0.005,0.005,0.005,0.005,0.01,0.02,0.04,0.06,0.08,0.09,0.09,
    0.08,0.07,0.06,0.05,0.05,0.04,0.04,0.03,0.025,0.02,0.02,0.015])
legit_hour_probs = legit_hour_probs / legit_hour_probs.sum()
hours = np.random.choice(range(24), N_LEGIT, p=legit_hour_probs)
legit["hour"] = hours
legit["is_night"] = ((hours >= 22) | (hours <= 5)).astype(int)
legit["day_of_week"] = np.random.randint(0, 7, N_LEGIT)
legit["is_weekend"] = (legit["day_of_week"] >= 5).astype(int)

# UPI-specific features
legit["new_device_flag"] = np.random.choice([0, 1], N_LEGIT, p=[0.95, 0.05])
legit["is_new_beneficiary"] = np.random.choice([0, 1], N_LEGIT, p=[0.85, 0.15])
legit["txn_count_1h"] = np.random.poisson(1.5, N_LEGIT)
legit["txn_count_24h"] = np.random.poisson(5, N_LEGIT)
legit["amount_avg_7d"] = np.random.lognormal(7.0, 0.5, N_LEGIT).round(2)
legit["amount_vs_7d_avg"] = (legit["amount"] / (legit["amount_avg_7d"] + 1)).round(4)
legit["beneficiary_age_days"] = np.random.exponential(90, N_LEGIT).round(1)
legit["account_age_days"] = np.random.exponential(365, N_LEGIT).round(0).astype(int)
legit["is_merchant_vpa"] = np.random.choice([0, 1], N_LEGIT, p=[0.6, 0.4])
legit["graph_contagion_score"] = np.random.beta(1, 10, N_LEGIT).round(4)
legit["fan_in_count_1h"] = np.random.poisson(0.5, N_LEGIT)
legit["drain_ratio_24h"] = np.random.beta(2, 5, N_LEGIT).round(4)
legit["is_festival_day"] = np.random.choice([0, 1], N_LEGIT, p=[0.92, 0.08])
legit["is_salary_day"] = np.random.choice([0, 1], N_LEGIT, p=[0.85, 0.15])
legit["city_tier"] = np.random.choice([1, 2, 3], N_LEGIT, p=[0.4, 0.35, 0.25])
legit["is_fraud"] = 0

# --- Generate fraudulent transactions ---
fraud = pd.DataFrame()
fraud["type"] = np.random.choice(["TRANSFER", "CASH_OUT", "PAYMENT"], N_FRAUD, p=[0.45, 0.40, 0.15])

# Fraud amounts tend to be higher
fraud["amount"] = np.abs(np.concatenate([
    np.random.lognormal(mean=9.5, sigma=0.8, size=N_FRAUD // 3),   # High value
    np.random.lognormal(mean=8.5, sigma=0.6, size=N_FRAUD // 3),   # Medium-high
    np.random.uniform(49000, 99999, size=N_FRAUD - 2 * (N_FRAUD // 3)),  # Near limit
])).round(2)
fraud["amount"] = np.clip(fraud["amount"], 500, 200000)

# Fraudsters operate at odd hours
fraud_hour_probs = np.array([0.06,0.07,0.08,0.08,0.07,0.06,0.04,0.03,0.02,0.02,0.02,0.02,
    0.02,0.02,0.02,0.02,0.02,0.03,0.04,0.05,0.05,0.06,0.06,0.055])
fraud_hour_probs = fraud_hour_probs / fraud_hour_probs.sum()
fraud_hours = np.random.choice(range(24), N_FRAUD, p=fraud_hour_probs)
fraud["hour"] = fraud_hours
fraud["is_night"] = ((fraud_hours >= 22) | (fraud_hours <= 5)).astype(int)
fraud["day_of_week"] = np.random.randint(0, 7, N_FRAUD)
fraud["is_weekend"] = (fraud["day_of_week"] >= 5).astype(int)

# Fraud UPI patterns
fraud["new_device_flag"] = np.random.choice([0, 1], N_FRAUD, p=[0.30, 0.70])
fraud["is_new_beneficiary"] = np.random.choice([0, 1], N_FRAUD, p=[0.20, 0.80])
fraud["txn_count_1h"] = np.random.poisson(4, N_FRAUD)
fraud["txn_count_24h"] = np.random.poisson(12, N_FRAUD)
fraud["amount_avg_7d"] = np.random.lognormal(6.5, 0.5, N_FRAUD).round(2)
fraud["amount_vs_7d_avg"] = (fraud["amount"] / (fraud["amount_avg_7d"] + 1)).round(4)
fraud["beneficiary_age_days"] = np.random.exponential(2, N_FRAUD).round(1)
fraud["account_age_days"] = np.random.exponential(30, N_FRAUD).round(0).astype(int)
fraud["is_merchant_vpa"] = np.random.choice([0, 1], N_FRAUD, p=[0.85, 0.15])
fraud["graph_contagion_score"] = np.random.beta(5, 2, N_FRAUD).round(4)
fraud["fan_in_count_1h"] = np.random.poisson(6, N_FRAUD)
fraud["drain_ratio_24h"] = np.random.beta(8, 2, N_FRAUD).round(4)
fraud["is_festival_day"] = np.random.choice([0, 1], N_FRAUD, p=[0.92, 0.08])
fraud["is_salary_day"] = np.random.choice([0, 1], N_FRAUD, p=[0.90, 0.10])
fraud["city_tier"] = np.random.choice([1, 2, 3], N_FRAUD, p=[0.3, 0.3, 0.4])
fraud["is_fraud"] = 1

# --- Combine ---
df = pd.concat([legit, fraud], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Add transaction IDs and UPI addresses
df.insert(0, "transaction_id", [f"txn_{i:06d}" for i in range(len(df))])
df.insert(1, "sender_upi", [f"user_{np.random.randint(1000,9999)}@{'okaxis' if np.random.random() > 0.5 else 'ybl'}" for _ in range(len(df))])
df.insert(2, "receiver_upi", [f"{'merchant' if row['is_merchant_vpa'] else 'user'}_{np.random.randint(1,999)}@{'paytm' if np.random.random() > 0.5 else 'upi'}" for _, row in df.iterrows()])

# Derived features
df["amount_log"] = np.log1p(df["amount"]).round(4)
df["velocity_score"] = (df["txn_count_1h"] * df["amount_vs_7d_avg"]).round(4)
df["risk_combo"] = (df["new_device_flag"] * df["is_new_beneficiary"] * df["is_night"]).astype(int)

os.makedirs("data", exist_ok=True)
df.to_csv("data/paysim_upi_dataset.csv", index=False)

print(f"Dataset saved: data/paysim_upi_dataset.csv")
print(f"Shape: {df.shape}")
print(f"Fraud rate: {df['is_fraud'].mean():.2%}")
print(f"\nFeature columns ({len(df.columns)}):")
print(df.columns.tolist())
print(f"\nClass distribution:\n{df['is_fraud'].value_counts()}")
