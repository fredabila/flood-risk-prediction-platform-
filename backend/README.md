# Backend API

## Goal
Serve ML predictions and spatial geometries to the Frontend dashboard.

## Stack
- Python FastAPI (recommended) or Node.js.
- PostgreSQL + PostGIS extension for spatial queries.

## Architecture
Expose endpoints that query the `flood_predictions` and `locations` tables.
Optimize spatial queries for rapid heatmap and polygon rendering on the frontend.
