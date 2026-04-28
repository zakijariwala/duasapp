import sqlite3
import json
import os

# Connect to your cleaned database
db_path = r'D:\Zaki\PWA2\RON.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create output directory
output_dir = 'duas_data'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# This list will store our search index metadata
search_index = []

# Get all valid Subindex IDs that have content
cursor.execute("SELECT DISTINCT SubindexId FROM linesmetadata")
ids = [row[0] for row in cursor.fetchall()]

print(f"Starting export of {len(ids)} files...")

for sub_id in ids:
    # 1. Fetch Titles from subindex
    cursor.execute("""
        SELECT EnglishName, RUrduName, UrduName, GujaratiName 
        FROM subindex WHERE Id = ?
    """, (sub_id,))
    title_row = cursor.fetchone()
    
    if not title_row:
        continue

    # Add to our Search Index list
    search_index.append({
        "id": sub_id,
        "en": title_row[0],
        "ro": title_row[1],
        "ur": title_row[2],
        "gu": title_row[3]
    })

    # 2. Fetch all verses using "Stitch" logic
    query = """
    SELECT 
        lm.Number,
        COALESCE(l.ArabicText1, '') || COALESCE(l.ArabicText2, '') || COALESCE(l.ArabicText3, '') || 
        COALESCE(l.ArabicText4, '') || COALESCE(l.ArabicText5, '') || COALESCE(l.ArabicText6, '') || 
        COALESCE(l.ArabicText7, '') || COALESCE(l.ArabicText8, '') || COALESCE(l.ArabicText9, '') || 
        COALESCE(l.ArabicText10, '') || COALESCE(l.ArabicText11, '') || COALESCE(l.ArabicText12, '') || 
        COALESCE(l.ArabicText13, '') || COALESCE(l.ArabicText14, '') || COALESCE(l.ArabicText15, '') || 
        COALESCE(l.ArabicText16, '') || COALESCE(l.ArabicText17, '') || COALESCE(l.ArabicText18, '') || 
        COALESCE(l.ArabicText19, '') || COALESCE(l.ArabicText20, '') as Arabic,
        l.RUrdu,
        l.English,
        l.Urdu,
        l.Gujarati
    FROM lines l
    JOIN linesmetadata lm ON l.Id = lm.LinesId
    WHERE lm.SubindexId = ?
    ORDER BY lm.Number ASC
    """
    cursor.execute(query, (sub_id,))
    verses = cursor.fetchall()

    # 3. Build the JSON structure
    data = {
        "id": sub_id,
        "title": {
            "en": title_row[0],
            "ro": title_row[1],
            "ur": title_row[2],
            "gu": title_row[3]
        },
        "verses": [
            {
                "no": v[0],
                "ar": v[1],
                "ro": v[2],
                "en": v[3],
                "ur": v[4],
                "gu": v[5]
            } for v in verses
        ]
    }

    # 4. Save individual Dua file
    with open(f"{output_dir}/{sub_id}.json", 'w', encoding='utf-16') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 5. Save the Master Search Index
with open(f"{output_dir}/search_index.json", 'w', encoding='utf-16') as f:
    json.dump(search_index, f, ensure_ascii=False, indent=2)

conn.close()
print(f"Export complete! {len(ids)} Duas exported.")
print("Master search index created at 'duas_data/search_index.json'.")