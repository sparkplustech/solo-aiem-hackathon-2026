import os
import joblib
import numpy as np
import random
from typing import Dict, Any, Tuple, List
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "lgbm_model.pkl"

# Global state
MODEL_ARTIFACT = None
EXPLAINER = None

def load_model():
    global MODEL_ARTIFACT, EXPLAINER
    if MODEL_PATH.exists():
        try:
            MODEL_ARTIFACT = joblib.load(MODEL_PATH)
            model = MODEL_ARTIFACT["model"]
            import shap
            EXPLAINER = shap.TreeExplainer(model)
            print(f"Loaded LightGBM model from {MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load model: {e}")
    else:
        print(f"Model file not found at {MODEL_PATH}. Using mock scorer.")

def get_risk_level(score: int) -> str:
    if score >= 80:
        return "red"
    elif score >= 50:
        return "yellow"
    return "green"

def score_transaction(features: Dict[str, float]) -> Tuple[int, str, List[Dict[str, Any]]]:
    """
    Returns (risk_score_0_100, risk_level, top_shap_features)
    """
    import warnings
    warnings.filterwarnings('ignore')
    
    global MODEL_ARTIFACT, EXPLAINER
    
    if MODEL_ARTIFACT is None or EXPLAINER is None:
        # Mock scoring
        score = random.randint(0, 100)
        level = get_risk_level(score)
        mock_shap = [
            {"feature": "amount_vs_7d_avg", "contribution": random.uniform(10, 30)},
            {"feature": "new_device_flag", "contribution": random.uniform(5, 20)},
            {"feature": "graph_contagion_score", "contribution": random.uniform(5, 15)},
        ]
        return score, level, mock_shap

    feature_names = MODEL_ARTIFACT["feature_names"]
    model = MODEL_ARTIFACT["model"]
    
    # Build feature vector
    x = np.zeros((1, len(feature_names)))
    for i, fname in enumerate(feature_names):
        x[0, i] = features.get(fname, 0.0)
        
    # Predict
    proba = model.predict_proba(x)[0, 1]
    score = int(proba * 100)
    level = get_risk_level(score)
    
    # SHAP
    shap_vals = EXPLAINER.shap_values(x)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1] # positive class
        
    contributions = shap_vals[0]
    
    # Get top 4 positive contributors
    feature_contribs = []
    for i, fname in enumerate(feature_names):
        if contributions[i] > 0:
            feature_contribs.append({
                "feature": fname,
                "contribution": round(float(contributions[i] * 100), 2)
            })
            
    # Sort by descending contribution
    feature_contribs.sort(key=lambda x: x["contribution"], reverse=True)
    top_shap = feature_contribs[:4]
    
    return score, level, top_shap
