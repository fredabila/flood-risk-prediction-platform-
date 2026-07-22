import sqlite3
import json
import math
import os

def detect_encroachments():
    print("Loading true waterway geometries...")
    with open('frontend/src/data/real_waterways.json', 'r') as f:
        waterways = json.load(f)
        
    # Extract points from waterways to build a simple fast index
    waterway_points = []
    for feature in waterways['features']:
        coords = feature['geometry']['coordinates']
        if not coords: continue
        # Subsample line vertices to keep the spatial check fast
        for p in coords[::3]:
            waterway_points.append(p)
            
    print(f"Loaded {len(waterway_points)} waterway nodes for spatial intersection check.")
    
    db_path = 'backend/db/local_dev.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT rowid, lat, lon, type FROM buildings")
    buildings = cursor.fetchall()
    
    print(f"Scanning {len(buildings)} structures against waterway buffers...")
    
    encroachments = []
    encroachment_radius = 0.0003 # roughly ~30-40 meters buffer zone
    
    for b in buildings:
        rowid, b_lat, b_lon, b_type = b
        
        is_illegal = False
        for wp in waterway_points:
            w_lon, w_lat = wp
            if abs(w_lon - b_lon) < encroachment_radius and abs(w_lat - b_lat) < encroachment_radius:
                dist = math.sqrt((w_lon - b_lon)**2 + ((w_lat - b_lat)/1.5)**2)
                if dist < encroachment_radius:
                    is_illegal = True
                    break
        
        if is_illegal:
            # We generate a building footprint (Polygon) to render on the map
            size = 0.0001
            polygon = [[
                [b_lon - size, b_lat - size],
                [b_lon + size, b_lat - size],
                [b_lon + size, b_lat + size],
                [b_lon - size, b_lat + size],
                [b_lon - size, b_lat - size]
            ]]
            encroachments.append({
                "type": "Feature",
                "properties": {"id": rowid, "type": b_type, "risk": "CRITICAL"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": polygon
                }
            })
            
    out_path = 'frontend/src/data/illegal_structures.json'
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        json.dump({
            "type": "FeatureCollection",
            "features": encroachments
        }, f)
        
    print(f"Detected and exported {len(encroachments)} high-risk illegal structures encroaching on waterways.")

if __name__ == "__main__":
    detect_encroachments()
