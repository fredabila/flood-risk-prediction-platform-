import http.server
import socketserver
import sqlite3
import json
import os
import joblib
import numpy as np

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db', 'local_dev.db')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models', 'artifacts', 'flood_risk_xgb_baseline.joblib')

try:
    ml_model = joblib.load(MODEL_PATH)
    print("XGBoost Model loaded successfully.")
except Exception as e:
    ml_model = None
    print("Warning: Could not load XGBoost model:", e)

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/weather/current':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if not os.path.exists(DB_PATH):
                self.wfile.write(json.dumps({"error": "No DB"}).encode())
                return
                
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM weather_forecasts ORDER BY created_at DESC LIMIT 1")
            row = cursor.fetchone()
            conn.close()
            
            if row:
                self.wfile.write(json.dumps(dict(row)).encode())
            else:
                self.wfile.write(json.dumps({"error": "No data"}).encode())
            return
            
        if self.path.startswith('/api/impact'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            try:
                base_spread = float(query.get('spread', [0.008])[0])
            except ValueError:
                base_spread = 0.008
                
            if not os.path.exists(DB_PATH):
                self.wfile.write(json.dumps({"error": "No DB"}).encode())
                return
                
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            hotspots = [
                (-0.2140, 5.5850),
                (-0.2350, 5.5700),
                (-0.2000, 5.6000),
                (-0.2600, 5.5450)
            ]
            
            cursor.execute("SELECT * FROM buildings")
            buildings = cursor.fetchall()
            
            impacted_pop = 0
            structures_risk = 0
            
            for b in buildings:
                b_lat = b['lat']
                b_lon = b['lon']
                est_pop = b['estimated_population']
                
                # Check if building falls within ANY of the 4 flood hotspots
                is_flooded = False
                for (cx, cy) in hotspots:
                    dx = b_lon - cx
                    dy = (b_lat - cy) / 1.5
                    dist = (dx**2 + dy**2)**0.5
                    if dist < base_spread:
                        is_flooded = True
                        break
                        
                if is_flooded:
                    impacted_pop += est_pop
                    structures_risk += 1
            
            conn.close()
            
            self.wfile.write(json.dumps({
                "impacted_population": impacted_pop,
                "structures_at_risk": structures_risk,
                "total_buildings_in_area": len(buildings)
            }).encode())
            return
        
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                messages = data.get('messages', [])
                
                import urllib.request
                url = "https://api.deepseek.com/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer sk-0365b910f69340b0864b49a71734557d"
                }
                
                system_msg = {
                    "role": "system",
                    "content": "You are the AI Intelligence Agent for the Flood Risk Command Center in Greater Accra. Answer concisely, professionally, and provide analytical insights based on the simulation data."
                }
                
                if not messages or messages[0].get("role") != "system":
                    messages.insert(0, system_msg)
                    
                payload = {
                    "model": "deepseek-chat",
                    "messages": messages,
                    "temperature": 0.3
                }
                
                req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
                with urllib.request.urlopen(req) as response:
                    res_body = response.read()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(res_body)
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif self.path == '/api/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                if ml_model is None:
                    raise Exception("XGBoost model not loaded.")
                
                rainfall = data.get('rainfallIntensity', 0)
                sea_level = data.get('seaLevelRise', 0)
                clear_waterways = data.get('clearWaterways', False)
                
                # Map 20 features for the Kaggle baseline model
                features = np.array([[
                    rainfall / 10.0,                 # MonsoonIntensity
                    5.0,                             # TopographyDrainage
                    8.0 if clear_waterways else 3.0, # RiverManagement
                    5.0,                             # Deforestation
                    5.0,                             # Urbanization
                    sea_level * 10.0,                # ClimateChange
                    5.0,                             # DamsQuality
                    4.0 if clear_waterways else 8.0, # Siltation
                    5.0,                             # AgriculturalPractices
                    2.0 if clear_waterways else 9.0, # Encroachments
                    5.0,                             # IneffectiveDisasterPreparedness
                    8.0 if clear_waterways else 3.0, # DrainageSystems
                    sea_level * 10.0,                # CoastalVulnerability
                    5.0,                             # Landslides
                    5.0,                             # Watersheds
                    6.0,                             # DeterioratingInfrastructure
                    7.0,                             # PopulationScore
                    6.0,                             # WetlandLoss
                    4.0 if clear_waterways else 8.0, # InadequatePlanning
                    5.0                              # PoliticalFactors
                ]])
                
                # Predict risk score
                risk_score = float(ml_model.predict(features)[0])
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"flood_probability": risk_score}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

PORT = 8004
print(f"Fallback Python HTTP Server running at port {PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
