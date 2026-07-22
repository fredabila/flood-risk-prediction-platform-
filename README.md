# Flood Risk Prediction Platform

Welcome to the Flood Risk Prediction Platform project repository. This project aims to simulate flood occurrences accurately by combining static terrain data with dynamic forecasting data.

## Project Structure

This repository is organized into distinct folders for each team to begin their work:

*   **`data_engineering/`**: Contains scripts and pipelines (e.g., Apache Airflow, AWS EventBridge) for ingesting static terrain data and daily weather forecasts (ECMWF, CHIRPS, GloFAS).
*   **`ml_models/`**: Dedicated space for Machine Learning models (XGBoost, Random Forest, LSTMs) focusing on Spatial Susceptibility and Temporal Forecasting.
*   **`backend/`**: Contains the API server code (e.g., FastAPI) and database schemas (PostgreSQL with PostGIS) to serve predictions.
*   **`frontend/`**: The dashboard interface (React/Vue.js) using mapping libraries (Mapbox GL JS / Leaflet) to visualize risk.
*   **`docs/`**: Project documentation, architecture diagrams, and meeting notes.

## Execution Plan

### Phase 1: Data Engineering
- **Focus:** Infrastructure & Pipelines
- **Key Deliverables:** Setup PostGIS. Build Python scripts to scrape/ingest daily CHIRPS, ECMWF, and GloFAS data into the database.

### Phase 2: ML Modeling
- **Focus:** Training & Validation
- **Key Deliverables:** Train a baseline Random Forest model using historical flood data in Ghana. Evaluate accuracy using metrics like F1-score and Area Under the Curve (AUC).

### Phase 3: API & Backend
- **Focus:** Connectivity
- **Key Deliverables:** Build REST endpoints to query predictions by date and region. Ensure spatial queries are optimized.

### Phase 4: Dashboard UI
- **Focus:** Visualization
- **Key Deliverables:** Connect the React/Mapbox frontend to the API. Implement color-coded heatmaps (e.g., Red = Extreme Risk) and time-sliders for future dates.

---
Please refer to the `README.md` in each respective folder for team-specific instructions.
