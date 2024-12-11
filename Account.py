import sqlite3
from datetime import datetime

def update_trip_table_with_data():
    conn = sqlite3.connect("train system1.db")
    cursor = conn.cursor()

    # Check if Trip table exists
    cursor.execute("""
        SELECT name FROM sqlite_master WHERE type='table' AND name='Trip';
    """)
    table_exists = cursor.fetchone()

    if table_exists:
        print("Updating the Trip table schema...")

        # Step 1: Rename the existing table
        cursor.execute("ALTER TABLE Trip RENAME TO Trip_backup;")

        # Step 2: Create the new table with updated schema
        cursor.execute("""
            CREATE TABLE Trip (
                TripID INTEGER PRIMARY KEY AUTOINCREMENT,
                SequenceNumber INT NOT NULL,
                ArrivalTime TEXT NOT NULL,
                DepartureTime TEXT NOT NULL,
                Price INT NOT NULL,
                AvailableSeats INT NOT NULL,
                Distance INT NOT NULL,
                StationID INT,
                FROMStationID INT,
                TrainID INT NOT NULL
            );
        """)

        # Step 3: Copy data back into the new table
        cursor.execute("""
            INSERT INTO Trip (SequenceNumber, ArrivalTime, DepartureTime, Price, 
                              AvailableSeats, Distance, StationID, FROMStationID, TrainID)
            SELECT SequenceNumber, ArrivalTime, DepartureTime, Price, 
                   AvailableSeats, Distance, StationID, FROMStationID, TrainID
            FROM Trip_backup;
        """)

        # Step 4: Drop the backup table
        cursor.execute("DROP TABLE Trip_backup;")
        print("Trip table updated successfully, and data has been preserved.")
    else:
        print("Trip table does not exist or is already up to date.")

    conn.commit()
    conn.close()

update_trip_table_with_data()