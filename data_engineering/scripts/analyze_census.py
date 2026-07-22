import os
import sqlite3
import zipfile
import csv
import io

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/db/spatial_data.db'))
ZIP_PATH = r'C:\Users\user\Downloads\10%_2021PHC_CSV.zip'

def process_census():
    print(f"Connecting to database...")
    
    materials = {}
    household_sizes = []
    total_accra_rows = 0
    
    print(f"Streaming Census Data from ZIP archive...")
    with zipfile.ZipFile(ZIP_PATH) as z:
        with z.open('CSV/defactopopn_10%_20221011d.csv') as f:
            text_f = io.TextIOWrapper(f, encoding='utf-8')
            reader = csv.DictReader(text_f)
            
            for row in reader:
                region = row.get('region', '')
                if region == 'Greater Accra':
                    total_accra_rows += 1
                    
                    # h03 is Outer Wall material
                    wall_mat = row.get('h03', 'Unknown')
                    if wall_mat:
                        materials[wall_mat] = materials.get(wall_mat, 0) + 1
                
                if total_accra_rows >= 30000:
                    break

    print(f"\n--- 2021 GHANA CENSUS (GREATER ACCRA SAMPLE) ---")
    print(f"Total surveyed in sample: {total_accra_rows} individuals")
    print("\nWall Material Vulnerability Distribution:")
    
    # Sort and display
    sorted_mats = sorted(materials.items(), key=lambda x: x[1], reverse=True)
    for m, count in sorted_mats:
        pct = (count / total_accra_rows) * 100
        print(f" - {m}: {pct:.1f}%")
        
    print("\nThis statistical distribution can now be mapped onto our local geographic building footprints!")

if __name__ == "__main__":
    process_census()
