from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI(title="Flood Risk Prediction API")

# Allow Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db', 'local_dev.db')

@app.get("/")
def read_root():
    return {"message": "Welcome to the Flood Risk Prediction API"}

@app.get("/api/weather/current")
def get_current_weather():
    if not os.path.exists(DB_PATH):
        return {"error": "Database not found. Please run the ingest.py script first."}
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Fetch the latest weather reading
    cursor.execute("SELECT * FROM weather_forecasts ORDER BY created_at DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"error": "No weather data available."}
        
    return dict(row)
