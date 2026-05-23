"""
DRISHTI ML Pipeline — LightGBM Training with Cost-Sensitive Learning
Trains on PaySim-inspired dataset with asymmetric cost matrix.
"""
import pandas as pd
import numpy as np
import lightgbm as lgb
import shap
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, roc_auc_score, confusion_matrix,
    precision_recall_curve, f1_score, precision_score, recall_score
)

print("=" * 60)
print("DRISHTI — LightGBM Training Pipeline v2")
print("=" * 60)

# Load dataset
df = pd.read_csv("data/paysim_upi_dataset.csv")
print(f"\nDataset: {df.shape[0]} rows, {df.shape[1]} cols")
print(f"Fraud rate: {df['is_fraud'].mean():.2%}")

# Feature columns (exclude IDs, target, raw text)
EXCLUDE = ["transaction_id", "sender_upi", "receiver_upi", "is_fraud", "type"]
FEATURE_COLS = [c for c in df.columns if c not in EXCLUDE]

# Encode transaction type
df["type_encoded"] = df["type"].map({
    "PAYMENT": 0, "TRANSFER": 1, "CASH_OUT": 2, "DEBIT": 3, "CASH_IN": 4
})
FEATURE_COLS.append("type_encoded")

X = df[FEATURE_COLS].values
y = df["is_fraud"].values

# Augment training set with operator decisions from backend SQLite
db_path = "../backend/data/transactions.db"
if os.path.exists(db_path):
    try:
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT tf.features_json, ol.decision 
            FROM transaction_features tf
            JOIN operator_labels ol ON tf.id = ol.txn_id
        """)
        rows = cursor.fetchall()
        conn.close()
        
        if rows:
            print(f"\n[Feedback Loop] Found {len(rows)} new analyst-labeled transactions in DB.")
            feedback_X = []
            feedback_y = []
            for f_json, decision in rows:
                try:
                    f_dict = json.loads(f_json)
                    vector = [float(f_dict.get(c, 0.0)) for c in FEATURE_COLS]
                    feedback_X.append(vector)
                    feedback_y.append(1 if decision.lower() == "block" else 0)
                except Exception as ex:
                    print(f"  Skipping row due to error: {ex}")
            
            if feedback_X:
                X = np.vstack([X, np.array(feedback_X)])
                y = np.concatenate([y, np.array(feedback_y)])
                print(f"[Feedback Loop] Successfully augmented dataset. New size: {X.shape[0]} samples.")
    except Exception as e:
        print(f"\n[Feedback Loop] Warning: could not load database feedback: {e}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

print(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

# --- FLAW 5 FIX: Cost-sensitive training ---
# False negative cost = avg fraud amount ≈ ₹8,000
# False positive cost = customer friction ≈ ₹50
# Ratio: 160:1 — but we cap at scale_pos_weight for stability
FN_COST = 8000  # Average fraud amount in ₹
FP_COST = 50    # Customer friction cost in ₹
COST_RATIO = FN_COST / FP_COST  # ~160

# Use sample weights instead of scale_pos_weight for finer control
sample_weights = np.where(y_train == 1, COST_RATIO, 1.0)

params = {
    "objective": "binary",
    "metric": "auc",
    "boosting_type": "gbdt",
    "n_estimators": 500,
    "learning_rate": 0.05,
    "max_depth": 7,
    "num_leaves": 63,
    "min_child_samples": 20,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "random_state": 42,
    "verbose": -1
}

print("\nTraining LightGBM with cost-sensitive weights...")
print(f"  FN cost: Rs.{FN_COST}, FP cost: Rs.{FP_COST}, ratio: {COST_RATIO:.0f}x")

model = lgb.LGBMClassifier(**params)
model.fit(
    X_train, y_train,
    sample_weight=sample_weights,
    eval_set=[(X_test, y_test)],
    callbacks=[lgb.log_evaluation(100)]
)

# --- Evaluation ---
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob >= 0.5).astype(int)

auc_roc = roc_auc_score(y_test, y_prob)
f1 = f1_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)

print(f"\n{'='*40}")
print(f"AUC-ROC:   {auc_roc:.4f}")
print(f"F1 Score:  {f1:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"{'='*40}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Legit", "Fraud"]))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")

# --- FLAW 5: Cost-of-Error Analysis ---
total_fn_cost = fn * FN_COST
total_fp_cost = fp * FP_COST
total_cost = total_fn_cost + total_fp_cost
savings_vs_no_model = (y_test.sum() * FN_COST) - total_cost

print(f"\n--- Cost-of-Error Analysis (per {len(y_test)} transactions) ---")
print(f"Missed fraud cost (FN x Rs.{FN_COST}):     Rs.{total_fn_cost:,.0f}")
print(f"Customer friction cost (FP x Rs.{FP_COST}):  Rs.{total_fp_cost:,.0f}")
print(f"Total error cost:                          Rs.{total_cost:,.0f}")
print(f"Savings vs no model:                       Rs.{savings_vs_no_model:,.0f}")

# --- SHAP explainer ---
print("\nComputing SHAP explainer...")
explainer_shap = shap.TreeExplainer(model)

# --- Feature importance ---
importance = model.feature_importances_
feat_importance = sorted(
    zip(FEATURE_COLS, importance),
    key=lambda x: x[1], reverse=True
)

print("\nTop 10 Features:")
for name, imp in feat_importance[:10]:
    print(f"  {name}: {imp}")

# --- Save artifacts ---
os.makedirs("artifacts", exist_ok=True)
os.makedirs("../backend/models", exist_ok=True)

artifact_dict = {
    "model": model,
    "feature_names": FEATURE_COLS
}

joblib.dump(artifact_dict, "../backend/models/lgbm_model.pkl")
joblib.dump(artifact_dict, "artifacts/lgbm_model.pkl")
joblib.dump(explainer_shap, "artifacts/shap_explainer.pkl")

# Save metadata for Model Transparency Panel
metadata = {
    "model_type": "LightGBM (Cost-Sensitive GBDT)",
    "dataset": "PaySim-inspired + UPI Feature Engineering",
    "dataset_size": int(len(df)),
    "train_size": int(len(X_train)),
    "test_size": int(len(X_test)),
    "n_features": len(FEATURE_COLS),
    "feature_names": FEATURE_COLS,
    "class_balance": {"legit": int((y == 0).sum()), "fraud": int((y == 1).sum())},
    "fraud_rate": round(float(y.mean()), 4),
    "metrics": {
        "auc_roc": round(auc_roc, 4),
        "f1_score": round(f1, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
    },
    "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    "cost_analysis": {
        "fn_cost_per_txn": FN_COST,
        "fp_cost_per_txn": FP_COST,
        "total_fn_cost": int(total_fn_cost),
        "total_fp_cost": int(total_fp_cost),
        "total_error_cost": int(total_cost),
        "savings_vs_no_model": int(savings_vs_no_model),
        "savings_per_10k_txns": int(savings_vs_no_model * 10000 / len(y_test)),
    },
    "feature_importance": [{"feature": n, "importance": int(i)} for n, i in feat_importance[:15]],
    "hyperparameters": params,
    "trained_at": pd.Timestamp.now().isoformat()
}

with open("artifacts/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\nArtifacts saved to artifacts/")
print(f"  - lgbm_model.pkl")
print(f"  - shap_explainer.pkl")
print(f"  - model_metadata.json")
print(f"\n[OK] Training complete!")
