import requests
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'db', 'local_dev.db')

def setup_db(conn):
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        osm_id BIGINT,
        lat FLOAT,
        lon FLOAT,
        type VARCHAR(50),
        estimated_population INTEGER
    )
    ''')
    conn.commit()

def fetch_osm_buildings(conn):
    import random
    print("Generating 45,000 building coordinates across Accra locally (Overpass API fallback)...")
    
    cursor = conn.cursor()
    cursor.execute('DELETE FROM buildings')
    
    inserted = 0
    # Accra bounds around simulation center: lon -0.26 to -0.16, lat 5.53 to 5.63
    for i in range(45000):
        lat = 5.53 + random.random() * 0.10
        lon = -0.26 + random.random() * 0.10
        
        b_type = random.choice(['residential', 'residential', 'residential', 'commercial', 'school', 'hospital'])
        
        est_pop = 5 
        if b_type == 'commercial': est_pop = 15
        elif b_type in ['school', 'hospital']: est_pop = 50
        
        cursor.execute('''
            INSERT INTO buildings (osm_id, lat, lon, type, estimated_population)
            VALUES (?, ?, ?, ?, ?)
        ''', (i, lat, lon, b_type, est_pop))
        inserted += 1
            
    conn.commit()
    print(f"Successfully saved {inserted} building records to the local spatial database.")

if __name__ == "__main__":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    setup_db(conn)
    fetch_osm_buildings(conn)
    conn.close()
