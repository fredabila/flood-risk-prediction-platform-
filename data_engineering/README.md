# Data Engineering

## Goal
To simulate flood occurrences accurately, we require a mix of static terrain data and dynamic forecasting data.

## Static Terrain & Spatial Data
- **Digital Elevation Models (DEM)**: Copernicus DEM or SRTM (30m resolution).
- **Land Use & Soil**: ESA WorldCover or local Ghanaian agencies.
- **River Networks**: OSM water layers + local hydrographic data.

## Dynamic Weather & Hydrological Data
- **Weather Forecasts**: ECMWF (precipitation and temperature).
- **Precipitation History**: CHIRPS.
- **River Flow**: GloFAS (daily probabilistic discharge forecasts).

## Architecture
- Python worker scripts to fetch APIs.
- Scheduled via Apache Airflow or AWS EventBridge.
- Load into PostgreSQL/PostGIS.
