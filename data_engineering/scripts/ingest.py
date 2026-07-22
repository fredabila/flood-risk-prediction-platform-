import requests
import sqlite3
import os
from datetime import datetime

# Path to local SQLite DB (Mocking our PostGIS for local development)
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'db', 'local_dev.db')

def setup_database():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Create the weather_forecasts table based on our schema
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS weather_forecasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name VARCHAR(100),
        forecast_date DATE,
        precipitation_mm FLOAT,
        humidity_percent FLOAT,
        temperature_c FLOAT,
        wind_speed_kmh FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    return conn

def fetch_ecmwf_forecast(conn):
    print("Fetching LIVE ECMWF Forecast for Accra via Open-Meteo...")
    
    # Open-Meteo provides free API access to the ECMWF weather models
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 5.6037,
        "longitude": -0.1870,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"],
        "timezone": "Africa/Accra"
    }
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("Failed to fetch data:", response.text)
        return
        
    data = response.json()
    current = data.get("current", {})
    
    temp = current.get("temperature_2m", 0)
    humidity = current.get("relative_humidity_2m", 0)
    precip = current.get("precipitation", 0)
    wind = current.get("wind_speed_10m", 0)
    
    print(f"Live Weather: {temp}°C, {precip}mm rain, {humidity}% humidity")
    
    # Insert into database
    cursor = conn.cursor()
    # We clear old mock data so the dashboard always gets the absolute latest row
    cursor.execute('DELETE FROM weather_forecasts')
    
    cursor.execute('''
        INSERT INTO weather_forecasts (location_name, forecast_date, precipitation_mm, humidity_percent, temperature_c, wind_speed_kmh)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ("Accra, GH", datetime.now().strftime("%Y-%m-%d"), precip, humidity, temp, wind))
    
    conn.commit()
    print("Successfully saved live weather to database!")

if __name__ == "__main__":
    conn = setup_database()
    fetch_ecmwf_forecast(conn)
    conn.close()
