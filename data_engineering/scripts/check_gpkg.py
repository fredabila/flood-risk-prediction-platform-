import sqlite3
import json

db_path = 'data_engineering/raw_data/waterways/waterways.gpkg'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", tables)

for t in tables:
    name = t[0]
    if 'geom' in name or 'waterway' in name.lower() or 'osm' in name.lower():
        try:
            columns = cursor.execute(f"PRAGMA table_info({name})").fetchall()
            print(f"Columns for {name}:", [c[1] for c in columns])
        except Exception as e:
            pass
