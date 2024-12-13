import sqlite3
from datetime import datetime

conn = sqlite3.connect('train_systemFF.db')

# Connect to your database
cursor = conn.cursor()

cursor.execute("""
SELECT name 
FROM sqlite_master 
WHERE type='table';
""")
tables = cursor.fetchall()

print("Tables in the database:")
for table in tables:
    print(f"- {table[0]}")

# Step 2: Get schema info for each table
for table in tables:
    table_name = table[0]
    print(f"\nSchema for table: {table_name}")

    # Fetch table columns and primary keys
    cursor.execute(f"PRAGMA table_info('{table_name}');")
    columns = cursor.fetchall()
    for col in columns:
        print(f"Column: {col[1]}, Type: {col[2]}, PK: {col[5]}")

    # Fetch foreign keys
    print("Foreign Keys:")
    cursor.execute(f"PRAGMA foreign_key_list('{table_name}');")
    foreign_keys = cursor.fetchall()
    if foreign_keys:
        for fk in foreign_keys:
            print(f"FK: Column '{fk[3]}' -> {fk[2]}.{fk[4]}")
    else:
        print("No foreign keys.")

# # Close the connection
conn.close()

