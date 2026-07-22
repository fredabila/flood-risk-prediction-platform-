from fastapi import FastAPI

app = FastAPI(title="Flood Risk Prediction API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Flood Risk Prediction API"}

@app.get("/predictions")
def get_predictions(date: str = None, region: str = None):
    # TODO: Connect to PostGIS and query `flood_predictions` table
    return {"predictions": []}
