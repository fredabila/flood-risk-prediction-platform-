# Machine Learning Models

## Strategy
We are solving two problems: **Spatial Susceptibility** and **Temporal Forecasting**.

## Models
1. **XGBoost / Random Forest**
   - **Goal:** Spatial susceptibility (where will it flood?).
   - **Features:** Static features (elevation, distance to river, land use) combined with current rainfall.
   - **Target:** Probability score (0-1) for specific grid cells.
   - **Focus Area:** Urban flash flooding in Accra.

2. **Long Short-Term Memory (LSTM) Networks**
   - **Goal:** Time-series forecasting (when will it flood?).
   - **Features:** Temporal sequence of rainfall, soil moisture, upstream flow.
   - **Target:** River discharge and streamflow (1-10 days).
   - **Focus Area:** Riverine flooding in the North (White Volta Basin).

## Delivery
Models will be deployed to a managed endpoint (AWS SageMaker, Google Vertex AI) running daily inference against new data.
