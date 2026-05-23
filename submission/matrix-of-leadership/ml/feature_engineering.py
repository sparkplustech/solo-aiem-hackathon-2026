"""
DRISHTI — Feature Engineering Pipeline
=======================================

Computes 40+ features from raw transaction data.
Reads:  ml/data/transactions_raw.csv
Writes: ml/data/transactions_features.csv

Feature groups:
  - Velocity features (txn counts & sums over 1h, 6h, 24h windows)
  - Baseline deviation (amount vs 7d/30d avg, z-score vs peer group)
  - Behavioral (device changes, time patterns, activity gaps)
  - Beneficiary (new beneficiary detection, beneficiary age)
  - Account (age, new account flag)
  - Temporal (festivals, salary days, hour patterns)
  - Merchant (MCC mismatch)
  - Cold-start (history tier)
"""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR: Path = Path(__file__).resolve().parent / "data"
INPUT_FILE: Path = DATA_DIR / "transactions_raw.csv"
OUTPUT_FILE: Path = DATA_DIR / "transactions_features.csv"

# Indian festival dates (YYYY-MM-DD)
FESTIVAL_DATES: set[str] = {
    "2025-10-20", "2025-10-21", "2025-10-22",  # Diwali
    "2025-11-01",                                # Bhai Dooj
    "2025-08-15",                                # Independence Day
    "2025-01-26",                                # Republic Day
    "2025-03-14",                                # Holi
    "2025-04-14",                                # Baisakhi
    "2025-09-05",                                # Ganesh Chaturthi
    "2025-10-02",                                # Gandhi Jayanti
}

SALARY_DAYS: set[int] = {1, 5, 10, 15, 25, 28, 30, 31}


def load_data() -> pd.DataFrame:
    """Load raw transaction data and parse timestamps."""
    print("  Loading raw transactions...")
    df = pd.read_csv(INPUT_FILE)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["sender_user_id", "timestamp"]).reset_index(drop=True)
    print(f"  Loaded {len(df):,} transactions")
    return df


# ---------------------------------------------------------------------------
# Velocity Features
# ---------------------------------------------------------------------------
def compute_velocity_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute rolling window velocity features per sender."""
    print("  Computing velocity features...")

    df = df.sort_values(["sender_user_id", "timestamp"]).reset_index(drop=True)
    df["timestamp_unix"] = df["timestamp"].astype(np.int64) // 10**9

    # Pre-allocate columns
    for col in [
        "txn_count_1h", "txn_count_6h", "txn_count_24h",
        "amount_sum_1h", "amount_sum_6h", "amount_sum_24h",
        "amount_max_1h", "amount_avg_1h",
    ]:
        df[col] = 0.0

    # Group by sender and compute rolling windows
    for sender_id, group in df.groupby("sender_user_id"):
        indices = group.index.tolist()
        timestamps = group["timestamp_unix"].values
        amounts = group["amount"].values

        for i, idx in enumerate(indices):
            ts = timestamps[i]

            # Look back through previous transactions
            for window_name, window_seconds in [("1h", 3600), ("6h", 21600), ("24h", 86400)]:
                mask = (timestamps[:i] >= ts - window_seconds) & (timestamps[:i] < ts)
                count = mask.sum()
                amt_sum = amounts[:i][mask].sum() if count > 0 else 0.0

                df.at[idx, f"txn_count_{window_name}"] = count
                df.at[idx, f"amount_sum_{window_name}"] = round(amt_sum, 2)

                if window_name == "1h":
                    df.at[idx, "amount_max_1h"] = amounts[:i][mask].max() if count > 0 else 0.0
                    df.at[idx, "amount_avg_1h"] = round(amounts[:i][mask].mean(), 2) if count > 0 else 0.0

    df.drop(columns=["timestamp_unix"], inplace=True)
    return df


# ---------------------------------------------------------------------------
# Baseline Deviation Features
# ---------------------------------------------------------------------------
def compute_baseline_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute amount deviation from historical baselines."""
    print("  Computing baseline deviation features...")

    df["amount_vs_7d_avg"] = 0.0
    df["amount_vs_30d_avg"] = 0.0
    df["amount_zscore_7d"] = 0.0
    df["amount_zscore_peer_group"] = 0.0

    # Peer group stats (by cohort)
    cohort_stats = df.groupby("cohort")["amount"].agg(["mean", "std"]).to_dict("index")

    for sender_id, group in df.groupby("sender_user_id"):
        indices = group.index.tolist()
        timestamps = group["timestamp"].values
        amounts = group["amount"].values
        cohort = group["cohort"].iloc[0]

        for i, idx in enumerate(indices):
            ts = timestamps[i]
            amt = amounts[i]

            # 7-day lookback
            mask_7d = (timestamps[:i] >= ts - np.timedelta64(7, 'D')) & (timestamps[:i] < ts)
            if mask_7d.sum() > 0:
                avg_7d = amounts[:i][mask_7d].mean()
                std_7d = amounts[:i][mask_7d].std()
                df.at[idx, "amount_vs_7d_avg"] = round(amt / avg_7d if avg_7d > 0 else 1.0, 4)
                df.at[idx, "amount_zscore_7d"] = round((amt - avg_7d) / (std_7d + 1e-6), 4)
            else:
                df.at[idx, "amount_vs_7d_avg"] = 1.0
                df.at[idx, "amount_zscore_7d"] = 0.0

            # 30-day lookback
            mask_30d = (timestamps[:i] >= ts - np.timedelta64(30, 'D')) & (timestamps[:i] < ts)
            if mask_30d.sum() > 0:
                avg_30d = amounts[:i][mask_30d].mean()
                df.at[idx, "amount_vs_30d_avg"] = round(amt / avg_30d if avg_30d > 0 else 1.0, 4)
            else:
                df.at[idx, "amount_vs_30d_avg"] = 1.0

            # Peer-group z-score
            peer_mean = cohort_stats.get(cohort, {}).get("mean", amt)
            peer_std = cohort_stats.get(cohort, {}).get("std", 1.0)
            df.at[idx, "amount_zscore_peer_group"] = round(
                (amt - peer_mean) / (peer_std + 1e-6), 4
            )

    return df


# ---------------------------------------------------------------------------
# Behavioral Features
# ---------------------------------------------------------------------------
def compute_behavioral_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute behavioral features: device, time, activity gaps."""
    print("  Computing behavioral features...")

    # Hour of day & night flag
    df["hour_of_day"] = df["timestamp"].dt.hour
    df["is_night"] = ((df["hour_of_day"] >= 22) | (df["hour_of_day"] <= 5)).astype(int)
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # Days since last transaction per sender
    df["days_since_last_txn"] = 0.0
    df["new_device_flag"] = 0
    df["device_change_count_7d"] = 0
    df["hour_deviation_from_median"] = 0.0

    for sender_id, group in df.groupby("sender_user_id"):
        indices = group.index.tolist()
        timestamps = group["timestamp"].values
        devices = group["device_id"].values
        hours = group["hour_of_day"].values
        primary_device = group["device_id"].iloc[0]

        # Median hour for the sender
        median_hour = np.median(hours)

        for i, idx in enumerate(indices):
            # Days since last
            if i > 0:
                delta = (timestamps[i] - timestamps[i - 1]) / np.timedelta64(1, 'D')
                df.at[idx, "days_since_last_txn"] = round(float(delta), 4)
            else:
                df.at[idx, "days_since_last_txn"] = -1.0  # First transaction

            # New device flag
            if devices[i] != primary_device:
                df.at[idx, "new_device_flag"] = 1

            # Device changes in last 7 days
            ts = timestamps[i]
            mask_7d = (timestamps[:i] >= ts - np.timedelta64(7, 'D')) & (timestamps[:i] < ts)
            if mask_7d.sum() > 0:
                unique_devices_7d = len(set(devices[:i][mask_7d]))
                df.at[idx, "device_change_count_7d"] = max(0, unique_devices_7d - 1)

            # Hour deviation
            df.at[idx, "hour_deviation_from_median"] = round(
                abs(hours[i] - median_hour), 2
            )

    return df


# ---------------------------------------------------------------------------
# Beneficiary Features
# ---------------------------------------------------------------------------
def compute_beneficiary_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute beneficiary-related features."""
    print("  Computing beneficiary features...")

    df["is_new_beneficiary"] = 0
    df["beneficiary_age_days"] = 0.0
    df["new_beneficiary_count_24h"] = 0
    df["unique_beneficiary_count_7d"] = 0
    df["beneficiary_txn_count"] = 0

    for sender_id, group in df.groupby("sender_user_id"):
        indices = group.index.tolist()
        timestamps = group["timestamp"].values
        beneficiaries = group["beneficiary_upi_id"].values

        seen_beneficiaries: dict[str, np.datetime64] = {}

        for i, idx in enumerate(indices):
            ben = beneficiaries[i]
            ts = timestamps[i]

            # Is new beneficiary?
            if ben not in seen_beneficiaries:
                df.at[idx, "is_new_beneficiary"] = 1
                df.at[idx, "beneficiary_age_days"] = 0.0
                seen_beneficiaries[ben] = ts
            else:
                first_seen = seen_beneficiaries[ben]
                age_days = (ts - first_seen) / np.timedelta64(1, 'D')
                df.at[idx, "beneficiary_age_days"] = round(float(age_days), 2)

            # New beneficiaries in last 24h
            new_ben_count = 0
            mask_24h = (timestamps[:i] >= ts - np.timedelta64(1, 'D')) & (timestamps[:i] < ts)
            if mask_24h.sum() > 0:
                recent_bens = set(beneficiaries[:i][mask_24h])
                # Count how many of recent bens were first seen in that window
                for rb in recent_bens:
                    if rb in seen_beneficiaries:
                        first = seen_beneficiaries[rb]
                        if first >= ts - np.timedelta64(1, 'D'):
                            new_ben_count += 1
            df.at[idx, "new_beneficiary_count_24h"] = new_ben_count

            # Unique beneficiaries in 7d
            mask_7d = (timestamps[:i] >= ts - np.timedelta64(7, 'D')) & (timestamps[:i] < ts)
            if mask_7d.sum() > 0:
                df.at[idx, "unique_beneficiary_count_7d"] = len(set(beneficiaries[:i][mask_7d]))

            # Total times this beneficiary has been paid before
            ben_count = (beneficiaries[:i] == ben).sum()
            df.at[idx, "beneficiary_txn_count"] = int(ben_count)

    return df


# ---------------------------------------------------------------------------
# Account Features
# ---------------------------------------------------------------------------
def compute_account_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute account-level features."""
    print("  Computing account features...")
    df["is_new_account"] = (df["account_age_days"] <= 30).astype(int)
    df["account_age_bucket"] = pd.cut(
        df["account_age_days"],
        bins=[0, 7, 30, 90, 180, 365, 730, float("inf")],
        labels=[0, 1, 2, 3, 4, 5, 6],
    ).astype(int)
    return df


# ---------------------------------------------------------------------------
# Temporal Features
# ---------------------------------------------------------------------------
def compute_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute temporal features: festivals, salary days."""
    print("  Computing temporal features...")

    df["date_str"] = df["timestamp"].dt.strftime("%Y-%m-%d")
    df["is_festival_day"] = df["date_str"].isin(FESTIVAL_DATES).astype(int)

    df["day_of_month"] = df["timestamp"].dt.day
    df["is_salary_day"] = df["day_of_month"].isin(SALARY_DAYS).astype(int)

    # Festival multiplier: average spend on festivals vs normal
    festival_avg = df[df["is_festival_day"] == 1]["amount"].mean()
    normal_avg = df[df["is_festival_day"] == 0]["amount"].mean()
    multiplier = festival_avg / normal_avg if normal_avg > 0 and not np.isnan(festival_avg) else 1.0
    df["festival_multiplier"] = np.where(df["is_festival_day"] == 1, round(multiplier, 4), 1.0)

    # Time since midnight in minutes (continuous)
    df["minutes_since_midnight"] = df["hour_of_day"] * 60 + df["timestamp"].dt.minute

    # Cyclical hour encoding
    df["hour_sin"] = np.sin(2 * np.pi * df["hour_of_day"] / 24).round(4)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour_of_day"] / 24).round(4)

    df.drop(columns=["date_str", "day_of_month"], inplace=True)
    return df


# ---------------------------------------------------------------------------
# Merchant Features
# ---------------------------------------------------------------------------
def compute_merchant_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute merchant/MCC features."""
    print("  Computing merchant features...")

    # Most common MCC per sender
    sender_mcc_mode = df.groupby("sender_user_id")["mcc_code"].agg(
        lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else x.iloc[0]
    ).to_dict()

    df["sender_primary_mcc"] = df["sender_user_id"].map(sender_mcc_mode)
    df["mcc_mismatch_flag"] = (df["mcc_code"] != df["sender_primary_mcc"]).astype(int)

    # Number of unique MCCs used by sender (overall)
    sender_mcc_count = df.groupby("sender_user_id")["mcc_code"].nunique().to_dict()
    df["sender_unique_mcc_count"] = df["sender_user_id"].map(sender_mcc_count)

    df.drop(columns=["sender_primary_mcc"], inplace=True)
    return df


# ---------------------------------------------------------------------------
# Cold-Start Features
# ---------------------------------------------------------------------------
def compute_cold_start_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute cold-start / history-tier features."""
    print("  Computing cold-start features...")

    # Count total transactions per sender up to each point
    df["sender_txn_rank"] = df.groupby("sender_user_id").cumcount()

    # History tier based on cumulative transactions
    def _tier(rank: int) -> int:
        if rank < 5:
            return 0  # Cold start
        elif rank < 20:
            return 1  # Warming up
        elif rank < 50:
            return 2  # Established
        else:
            return 3  # Mature

    df["history_tier"] = df["sender_txn_rank"].apply(_tier)

    # Confidence score based on history
    df["history_confidence"] = np.clip(df["sender_txn_rank"] / 50.0, 0.0, 1.0).round(4)

    return df


# ---------------------------------------------------------------------------
# Amount Features
# ---------------------------------------------------------------------------
def compute_amount_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute additional amount-related features."""
    print("  Computing amount features...")

    df["log_amount"] = np.log1p(df["amount"]).round(4)
    df["amount_is_round"] = (df["amount"] % 100 == 0).astype(int)
    df["amount_is_large"] = (df["amount"] > 10_000).astype(int)

    # Amount percentile within cohort
    cohort_ranks = df.groupby("cohort")["amount"].rank(pct=True)
    df["amount_percentile_cohort"] = cohort_ranks.round(4)

    return df


# ---------------------------------------------------------------------------
# Location Features
# ---------------------------------------------------------------------------
def compute_location_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute location-based features."""
    print("  Computing location features...")

    df["location_change_flag"] = 0

    for sender_id, group in df.groupby("sender_user_id"):
        indices = group.index.tolist()
        lats = group["latitude"].values
        lons = group["longitude"].values

        for i, idx in enumerate(indices):
            if i > 0:
                # Haversine-lite: simple distance check
                dlat = abs(lats[i] - lats[i - 1])
                dlon = abs(lons[i] - lons[i - 1])
                if dlat > 0.5 or dlon > 0.5:  # ~50km threshold
                    df.at[idx, "location_change_flag"] = 1

    return df


# ---------------------------------------------------------------------------
# Main Pipeline
# ---------------------------------------------------------------------------
def main() -> None:
    """Run the full feature engineering pipeline."""
    print("=" * 60)
    print("DRISHTI — Feature Engineering Pipeline")
    print("=" * 60)

    df = load_data()

    # Subsample for faster feature computation if dataset is very large
    # (velocity features are O(n²) per sender in naive approach)
    original_len = len(df)
    print(f"\n  Processing {original_len:,} transactions...")

    print("\n[1/9] Velocity features...")
    df = compute_velocity_features(df)

    print("[2/9] Baseline deviation features...")
    df = compute_baseline_features(df)

    print("[3/9] Behavioral features...")
    df = compute_behavioral_features(df)

    print("[4/9] Beneficiary features...")
    df = compute_beneficiary_features(df)

    print("[5/9] Account features...")
    df = compute_account_features(df)

    print("[6/9] Temporal features...")
    df = compute_temporal_features(df)

    print("[7/9] Merchant features...")
    df = compute_merchant_features(df)

    print("[8/9] Cold-start features...")
    df = compute_cold_start_features(df)

    print("[9/9] Amount & location features...")
    df = compute_amount_features(df)
    df = compute_location_features(df)

    # List all computed features
    original_cols = {
        "txn_id", "timestamp", "sender_upi_id", "sender_name", "sender_user_id",
        "beneficiary_upi_id", "amount", "currency", "device_id", "latitude",
        "longitude", "city", "cohort", "account_age_days", "mcc_code",
        "is_fraud", "fraud_type",
    }
    feature_cols = [c for c in df.columns if c not in original_cols]
    print(f"\n  Total features computed: {len(feature_cols)}")
    print(f"  Feature list:")
    for i, col in enumerate(feature_cols, 1):
        print(f"    {i:2d}. {col}")

    # Save
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n✓ Saved to {OUTPUT_FILE}")
    print(f"  File size: {OUTPUT_FILE.stat().st_size / (1024*1024):.2f} MB")
    print(f"  Shape: {df.shape}")


if __name__ == "__main__":
    main()
