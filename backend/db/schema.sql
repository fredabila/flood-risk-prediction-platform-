-- Represents specific districts, regions, or grid cells in Ghana
CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    region VARCHAR(50),
    geom GEOMETRY(Polygon, 4326) -- Stores map boundaries
);

-- Daily weather data ingested from APIs
CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES locations(id),
    forecast_date DATE,
    precipitation_mm FLOAT,
    soil_moisture_index FLOAT,
    temperature_c FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- The output from your ML models
CREATE TABLE flood_predictions (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES locations(id),
    target_date DATE,
    risk_score FLOAT, -- Probability between 0.00 and 1.00
    risk_category VARCHAR(20), -- 'Low', 'Moderate', 'High', 'Extreme'
    model_version VARCHAR(50), -- e.g., 'xgboost-v1.2'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
