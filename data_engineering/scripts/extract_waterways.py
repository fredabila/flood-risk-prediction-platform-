import sqlite3
import struct
import json
import os

def parse_wkb_linestring(wkb_data):
    try:
        byte_order = wkb_data[0]
        endian = '<' if byte_order == 1 else '>'
        
        wkb_type = struct.unpack(endian + 'I', wkb_data[1:5])[0]
        if wkb_type != 2: # 2 = LineString
            return None
            
        num_points = struct.unpack(endian + 'I', wkb_data[5:9])[0]
        points = []
        offset = 9
        for i in range(num_points):
            x, y = struct.unpack(endian + 'dd', wkb_data[offset:offset+16])
            points.append([x, y])
            offset += 16
        return points
    except Exception:
        return None

def extract_gpkg(db_path, output_json):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT geom, waterway, name FROM waterways WHERE waterway IN ('river', 'drain', 'canal', 'stream')")
    
    features = []
    
    for row in cursor.fetchall():
        blob, waterway, name = row
        if not blob or blob[:2] != b'GP':
            continue
            
        flags = blob[3]
        env_indicator = (flags >> 1) & 0x07
        
        header_size = 8
        if env_indicator == 1: header_size += 32
        elif env_indicator == 2: header_size += 48
        elif env_indicator == 3: header_size += 48
        elif env_indicator == 4: header_size += 64
        
        wkb_data = blob[header_size:]
        coords = parse_wkb_linestring(wkb_data)
        
        if coords:
            features.append({
                "type": "Feature",
                "properties": {"waterway": waterway, "name": name},
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords
                }
            })
            
    # Filter for Greater Accra bounding box
    accra_features = []
    for f in features:
        coords = f["geometry"]["coordinates"]
        if coords:
            # Check bounding box: lon -0.35 to 0.0, lat 5.5 to 5.75
            x, y = coords[0]
            if -0.35 <= x <= 0.0 and 5.5 <= y <= 5.75:
                accra_features.append(f)
            
    geojson = {
        "type": "FeatureCollection",
        "features": accra_features
    }
    
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, 'w') as f:
        json.dump(geojson, f)
        
    print(f"Extracted {len(accra_features)} real river/drain geometries in Accra!")

if __name__ == '__main__':
    extract_gpkg('data_engineering/raw_data/waterways/waterways.gpkg', 'frontend/src/data/real_waterways.json')
