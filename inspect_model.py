import joblib
import os

model_path = os.path.join('ml_models', 'artifacts', 'accra_flood_risk_xgb.joblib')
model = joblib.load(model_path)

if hasattr(model, 'feature_names_in_'):
    print("Features:", model.feature_names_in_)
elif hasattr(model, 'get_booster'):
    print("Features:", model.get_booster().feature_names)
else:
    print("Could not find feature names.")
