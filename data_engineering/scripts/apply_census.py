import os
import sqlite3
import random

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/db/local_dev.db'))

def apply_census():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column exists
    try:
        cursor.execute('ALTER TABLE buildings ADD COLUMN material TEXT')
    except sqlite3.OperationalError:
        pass # Column might already exist
        
    # Get all building IDs
    cursor.execute('SELECT rowid FROM buildings')
    rows = cursor.fetchall()
    
    # Probabilities from 2021 Census
    choices = [
        ('Metal sheet', 0.750),
        ('Slate/Asbestos', 0.161),
        ('Cement/Concrete', 0.063),
        ('Thatch/Palm leaves or Raffia', 0.013),
        ('Roofing Tiles', 0.007),
        ('Mud/Mud bricks/Earth', 0.003), # combined slight rounding margin
        ('Wood/Bamboo', 0.003)
    ]
    materials = [c[0] for c in choices]
    weights = [c[1] for c in choices]
    
    print(f"Applying real census distributions to {len(rows)} geographic structures...")
    
    updates = []
    for row in rows:
        mat = random.choices(materials, weights=weights, k=1)[0]
        updates.append((mat, row[0]))
        
    cursor.executemany('UPDATE buildings SET material = ? WHERE rowid = ?', updates)
    conn.commit()
    print("Successfully mapped Census vulnerabilities to the backend simulation spatial database!")

if __name__ == "__main__":
    apply_census()
