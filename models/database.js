const db = require("better-sqlite3")("train_systemFF.db");

function usernameExists(username) {
  return db.prepare("SELECT * FROM Account WHERE username = ?").get(username);
}

function emailExists(email) {
  return (
    db.prepare("SELECT * FROM Person WHERE email = ?").get(email) !== undefined
  );
}

function isAdmin(username) {
  const query = `
        SELECT s.Role
        FROM Account a
        JOIN Person p ON a.PersonID = p.PersonID
        JOIN Staff s ON p.PersonID = s.PersonID
        WHERE a.Username = ?;
    `;
  const result = db.prepare(query).get(username);
  return result.Role;
}

function isStaff(username) {
  const query = `
        SELECT s.Role
        FROM Account a
        JOIN Person p ON a.PersonID = p.PersonID
        JOIN Staff s ON p.PersonID = s.PersonID
        WHERE a.Username = ?;
    `;
  const result = db.prepare(query).get(username);
  return result.Role;
}

function isPassenger(username) {
  const query = `
        SELECT *
        FROM Account a
        JOIN Person p ON a.PersonID = p.PersonID
        JOIN Passenger ps ON p.PersonID = ps.PersonID
        WHERE a.Username = ?;
    `;
  const result = db.prepare(query).get(username);
  return result !== undefined; // If a result exists, the user is a Passenger
}

function getRole(username) {
  const IsStaff = isStaff(username);
  if (isPassenger(username)) return "Passenger";
  else if (IsStaff === "Driver" || IsStaff === "Engineer") IsStaff;
  else if (isAdmin(username) == "Admin") return "Admin";
  return undefined;
}

// Function to fetch user data by username
function getUserData(username) {
  if (isPassenger(username)) {
    return getPassengerData(username);
  } else if (isStaff(username)) {
    return getStaffData(username);
  } else if (isStaff(username)) {
    return getStaffData(username);
  }
  return undefined;
}

function getAdminData(username) {
  const query = `
        SELECT 
            p.PersonID,
            p.First_Name,
            p.Last_Name,
            p.Email,
            p.contactNumber,
            p.Login_Timestamp,
            p.Is_Logged_In,
            s.Staff_ID_,
            s.Role,
            s.Shift_Timing_,
            a.Username
        FROM 
            Account a
        JOIN 
            Person p ON a.PersonID = p.PersonID
        JOIN 
            Staff_ s ON p.PersonID = s.PersonID
        WHERE 
            a.Username = ? AND s.Role = 'Admin';
    `;
  return db.prepare(query).get(username);
}

function getStaffData(username) {
  const query = `
        SELECT 
            s.Role,
            p.PersonID,
            p.First_Name,
            p.Last_Name,
            p.Email
        FROM 
            Account a
        JOIN 
            Person p ON a.PersonID = p.PersonID
        JOIN 
            Staff s ON p.PersonID = s.PersonID
        WHERE 
            a.Username = ? AND (s.Role = 'Engineer' OR s.Role = 'Driver');
    `;
  return db.prepare(query).get(username);
}

function getPassengerData(username) {
  const query = `
          SELECT 
              p.PersonID,
              p.First_Name,
              p.Last_Name,
              p.Email,
              ps.LoyaltyMiles,
              ps.IdentificationDoc,
              a.Username,
              lc.ClassName AS LoyaltyClass,
              lc.DiscountPercentage AS LoyaltyDiscount
          FROM 
              Account a
          JOIN 
              Person p ON a.PersonID = p.PersonID
          JOIN 
              Passenger ps ON p.PersonID = ps.PersonID
          LEFT JOIN 
              CLASSIFIED c ON p.PersonID = c.PersonID
          LEFT JOIN 
              Loyal_Class lc ON c.LoyaltyClassID = lc.LoyaltyClassID
          WHERE 
              a.Username = ?;
      `;
  return db.prepare(query).get(username);
}

function addAccount(person) {
  const accountInsert = db.prepare(`
        INSERT INTO Account (AccountID, PersonID, Username, Password)
        VALUES (?, ?, ?, ?)
    `);

  let id = generateAccountID();

  const accountResult = accountInsert.run(
    id,
    person.id,
    person.username,
    person.password, // Ensure password is hashed before calling this function
  );
  return accountResult.lastInsertRowid;
}

function generateAccountID() {
  const query = `SELECT MAX(AccountID) AS maxID FROM Account;`;
  const result = db.prepare(query).get();
  return (result.maxID || 0) + 1; // Increment the highest existing AccountID by 1
}

function addPerson(person) {
  const personInsert = db.prepare(`
        INSERT INTO Person (PersonID, First_Name, Last_Name, Email)
        VALUES (?, ?, ?, ?)
    `);
  const result = personInsert.run(
    person.id,
    person.firstName,
    person.lastName,
    person.email,
  );
  return result.lastInsertRowid; // Return the generated PersonID
}

function addPassenger(person) {
  addPerson(person);
  addAccount(person);
  const passengerInsert = db.prepare(`
        INSERT INTO Passenger (PersonID, IdentificationDoc, LoyaltyMiles)
        VALUES (?, ?, 0)
    `);
  const result = passengerInsert.run(
    person.id,
    person.document, // Use `IdentificationDoc` instead of `_Identification_Document`
  );
  console.log("Successfully added the passenger");
  return result.lastInsertRowid;
}

function addAdmin(id) {
  const adminInsert = db.prepare(`
          INSERT INTO Staff (PersonID, Role)
          VALUES (?, 'Admin')
      `);
  const result = adminInsert.run(id);
  console.log("Successfully added the Admin");
  return result.lastInsertRowid;
}

// addAdmin(12323);
function insertTicket(ticket) {
  const index = getLastIndexTicket() + 1;
  const query = `
        INSERT INTO Ticket (TicketID, CoachType, TicketStatus, SeatNumber, IsPaid, TotalAmount, PersonID, TripID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

  const stmt = db.prepare(query);

  const result = stmt.run(
    index,
    ticket.CoachType, // e.g., 'Economy' or 'Business'
    ticket.TicketStatus, // e.g., 'Confirmed' or 'Pending'
    ticket.SeatNumber, // e.g., '15B'
    ticket.IsPaid, // e.g., 1 for paid, 0 for unpaid
    ticket.TotalAmount, // e.g., 50.00
    ticket.PersonID, // Foreign key to the Person table
    ticket.TripID, // Foreign key to the Trip table
  );

  console.log(`Inserted Ticket ID: ${result.lastInsertRowid}`);
  return result.lastInsertRowid; // Return the ID of the newly created ticket
}

function getLastIndexTicket() {
  const query = `SELECT MAX(TicketID) AS LastIndex FROM Ticket`; // Assuming TicketID is the primary key
  const result = db.prepare(query).get();

  if (result && result.LastIndex !== null) {
    return result.LastIndex;
  } else {
    return 0; // If no records exist in the Ticket table
  }
}

function insertTrip({
  TripID,
  sequenceNumber,
  arrivalTime,
  departureTime,
  price,
  availableSeats,
  distance,
  stationID,
  fromStationID,
  trainID,
}) {
  // Prepare database statements
  const checkTripIDQuery = `SELECT 1 FROM Trip WHERE TripID = ?`;
  const checkStationQuery = `SELECT 1 FROM Station WHERE StationID = ?`;
  const checkTrainQuery = `SELECT 1 FROM Train WHERE TrainID = ?`;

  const insertQuery = `
      INSERT INTO Trip 
      (TripID, SequenceNumber, ArrivalTime, DepartureTime, Price, AvailableSeats, Distance, StationID, FROMStationID, TrainID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

  try {
    // Check if TripID already exists
    const tripExists = db.prepare(checkTripIDQuery).get(TripID);
    if (tripExists) {
      throw new Error(`TripID ${TripID} already exists.`);
    }

    // Check if StationID exists (if provided)
    if (stationID) {
      const stationExists = db.prepare(checkStationQuery).get(stationID);
      if (!stationExists) {
        throw new Error(`StationID ${stationID} does not exist.`);
      }
    }

    // Check if FROMStationID exists (if provided)
    if (fromStationID) {
      const fromStationExists = db
        .prepare(checkStationQuery)
        .get(fromStationID);
      if (!fromStationExists) {
        throw new Error(`FROMStationID ${fromStationID} does not exist.`);
      }
    }

    // Check if TrainID exists
    const trainExists = db.prepare(checkTrainQuery).get(trainID);
    if (!trainExists) {
      throw new Error(`TrainID ${trainID} does not exist.`);
    }

    // Insert data into the Trip table
    const stmt = db.prepare(insertQuery);
    const result = stmt.run(
      TripID,
      sequenceNumber,
      arrivalTime,
      departureTime,
      price,
      availableSeats,
      distance,
      stationID,
      fromStationID,
      trainID,
    );

    console.log("Trip inserted successfully:", result);
    return result.lastInsertRowid;
  } catch (error) {
    console.error("Error inserting trip:", error.message);
    throw error;
  }
}

function addDependent(name, relationship, personID) {
  try {
    const sql = `
            INSERT INTO Dependent (Name, Relationship, PersonID)
            VALUES (?, ?, ?);
        `;
    const stmt = db.prepare(sql);
    stmt.run(name, relationship, personID);
    return { success: true, message: "Dependent added successfully" };
  } catch (error) {
    console.error("Error inserting dependent:", error);
    return { success: false, message: "Failed to add dependent" };
  }
}

// insertTicket({CoachType: 'Economy',    // Example values
//     TicketStatus: 'Confirmed',
//     SeatNumber: '15B',
//     IsPaid: 0,               // Unpaid ticket
//     TotalAmount: 50.00,      // Total ticket price
//     PersonID: 2222,           // Example PersonID
//     TripID: 3   })

function getActiveTrains() {
  const query = `
        SELECT 
            Train.EnglishName, 
            Train.ArabicName, 
            Trip.DepartureTime, 
            Trip.ArrivalTime, 
            StationFrom.StationName AS FromStation, 
            StationTo.StationName AS ToStation
        FROM 
            Trip
        JOIN 
            Train ON Train.TrainID = Trip.TrainID
        JOIN 
            Station AS StationFrom ON Trip.FROMStationID = StationFrom.StationID
        JOIN 
            Station AS StationTo ON Trip.StationID = StationTo.StationID
        WHERE 
            datetime('now', 'localtime') BETWEEN Trip.DepartureTime AND Trip.ArrivalTime;
    `;
  return db.prepare(query).all();
}

function getScheduledUnpaidTickets() {
  const query = `
        SELECT 
            t.TicketID,
            t.CoachType,
            t.TicketStatus,
            t.SeatNumber,
            t.IsPaid,
            t.TotalAmount,
            p.First_Name AS PassengerFirstName,
            p.Last_Name AS PassengerLastName,
            tr.TripID,
            tr.DepartureTime,
            tr.ArrivalTime,
            tr.Price,
            tr.AvailableSeats,
            s.StationName AS FromStation,
            s2.StationName AS ToStation
        FROM 
            Ticket t
        JOIN 
            Person p ON t.PersonID = p.PersonID
        JOIN 
            Trip tr ON t.TripID = tr.TripID
        JOIN 
            Station s ON tr.StationID = s.StationID
        JOIN 
            Station s2 ON tr.FROMStationID = s2.StationID
        WHERE 
            LOWER(t.IsPaid) = 'no';
    `;

  return db.prepare(query).all(); // Fetch all unpaid tickets
}

function getTripsDetails() {
  const sql = `
      SELECT 
        t.TrainID,
        t.ArabicName,
        t.EnglishName,
        f.StationName AS FromStation,
        s.StationName AS ToStation,
        tr.ArrivalTime,
        tr.DepartureTime,
        tr.Price,
        tr.AvailableSeats,
        tr.FROMStationID,
        tr.StationID,
        tr.TripID,
        t.Capacity
      FROM 
        Train t
      JOIN 
        Trip tr ON t.TrainID = tr.TrainID
      JOIN 
        Station f ON tr.FROMStationID = f.StationID
      JOIN 
        Station s ON tr.StationID = s.StationID;
    `;
  return db.prepare(sql).all(); // Return the result of the query
}

function getAvailableSeats(tripID) {
  const query = "SELECT AvailableSeats FROM Trip WHERE TripID = ?";
  const result = db.prepare(query).get(tripID);
  return result ? result.AvailableSeats : null;
}

function getTrainCapacity(trainID) {
  const query = "SELECT Capacity FROM Train WHERE TrainID = ?";
  const result = db.prepare(query).get(trainID);
  return result ? result.Capacity : null;
}

function getTrainIDByTripID(tripID) {
  const query = "SELECT TrainID FROM Trip WHERE TripID = ?";
  const result = db.prepare(query).get(tripID);
  return result ? result.TrainID : null;
}

function getDependentsByPersonID(personID) {
  const sql = `
        SELECT Name, Relationship, PersonID
        FROM Dependent
        WHERE PersonID = ?;
    `;
  const dependents = db.prepare(sql).all(personID); // Execute the query
  return dependents;
}

function updateAvailableSeats(tripId, newAvailableSeats) {
  try {
    const updateQuery = `UPDATE Trip SET AvailableSeats = ? WHERE TripID = ?;`;
    db.prepare(updateQuery).run(newAvailableSeats, tripId);

    console.log(
      `Available seats updated for TripID ${tripId}: ${newAvailableSeats}`,
    );
  } catch (error) {
    console.error(`Error updating available seats: ${error.message}`);
  }
}

function addToWaitingList({
  reservationDate,
  tempReservationExpiryDate,
  status,
  passengerId,
  tripId,
  personId,
}) {
  const query = `
      INSERT INTO WaitingList (ReservationDate, TempReservationExpiryDate, Status, PassengerD, TripID, PersonID)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
  const stmt = db.prepare(query);
  stmt.run(
    reservationDate,
    tempReservationExpiryDate,
    status,
    passengerId,
    tripId,
    personId,
  );
}

function getDepartureTime(tripId) {
  const departureQuery = `SELECT DepartureTime FROM Trip WHERE TripID = ?;`;
  const result = db.prepare(departureQuery).get(tripId);
  if (!result) {
    throw new Error("Invalid TripID provided.");
  }
  return new Date(result.DepartureTime); // Convert to Date object
}

function getTicketsByPersonId(personId) {
  const query = `
    SELECT 
      Ticket.TicketID,
      Ticket.CoachType,
      Ticket.TicketStatus,
      Ticket.SeatNumber,
      Ticket.IsPaid,
      Ticket.TotalAmount,
      Trip.ArrivalTime,
      Trip.DepartureTime,
      Trip.Price AS TripPrice,
      StationFrom.StationName AS FromStation,
      StationTo.StationName AS ToStation
    FROM Ticket
    JOIN Trip ON Ticket.TripID = Trip.TripID
    JOIN Station AS StationFrom ON Trip.FROMStationID = StationFrom.StationID
    JOIN Station AS StationTo ON Trip.StationID = StationTo.StationID
    WHERE Ticket.PersonID = ?;
  `;

  const stmt = db.prepare(query);
  const tickets = stmt.all(personId); // Fetch all tickets for the given PersonID

  return tickets || [];
}

function updatePaymentStatus(ticketId) {
  const query = `
      UPDATE Ticket 
      SET IsPaid = 'Yes', TicketStatus = 1
      WHERE TicketID = ?;
    `;

  const stmt = db.prepare(query);
  const result = stmt.run(ticketId);

  if (result.changes === 0) {
    // No rows were updated
    throw new Error(`No ticket found with TicketID: ${ticketId}`);
  }

  console.log(`Payment updated successfully for TicketID: ${ticketId}`);
}

function deleteTicketById(ticketId) {
  try {
    const query = `
        DELETE FROM Ticket
        WHERE TicketID = ?;
      `;

    const stmt = db.prepare(query);
    const result = stmt.run(ticketId);

    // if (result.changes === 0) {
    //   throw new Error(`No ticket found with TicketID: ${ticketId}`);
    // }

    console.log(`Ticket with TicketID: ${ticketId} deleted successfully.`);
    return {
      success: true,
      message: `Ticket with TicketID: ${ticketId} deleted successfully.`,
    };
  } catch (err) {
    console.error("Error deleting ticket:", err.message);
    throw err;
  }
}

function deletePassenger(personID) {
  try {
    const query = `
          DELETE FROM Passenger
          WHERE PersonID = ?;
        `;

    const stmt = db.prepare(query);
    const result = stmt.run(personID);

    // if (result.changes === 0) {
    //   throw new Error(`No ticket found with TicketID: ${ticketId}`);
    // }

    console.log(`passenger: ${personID} deleted successfully.`);
    return {
      success: true,
      message: `passenger: ${ticketId} deleted successfully.`,
    };
  } catch (err) {
    console.error("Error deleting paseenger:", err.message);
    throw err;
  }
}

function getTotalTrains() {
  try {
    const query = `SELECT COUNT(*) AS TotalTrains FROM Train;`;
    const result = db.prepare(query).get(); // Execute the query
    return result.TotalTrains; // Return the total count
  } catch (err) {
    console.error("Error fetching total number of trains:", err.message);
    return 0; // Return 0 if there is an error
  }
}

function getTotalPassengers() {
  try {
    const query = `SELECT COUNT(*) AS TotalPassengers FROM Passenger;`;
    const result = db.prepare(query).get(); // Execute the query
    return result.TotalPassengers; // Return the total count
  } catch (err) {
    console.error("Error fetching total number of passengers:", err.message);
    return 0; // Return 0 if there is an error
  }
}

function getTotalPendingTickets() {
  return getScheduledUnpaidTickets().length;
}

function getAllStaff() {
  try {
    const query = `
      SELECT 
        s.PersonID,
        p.First_Name,
        p.Last_Name,
        p.Email,
        s.Role
      FROM 
        Staff s
      JOIN 
        Person p ON s.PersonID = p.PersonID
      WHERE 
        s.Role IN ('Engineer', 'Driver');
    `;

    const result = db.prepare(query).all(); // Execute the query
    return result; // Return the array of engineers and drivers
  } catch (err) {
    console.error("Error fetching engineers and drivers:", err.message);
    return []; // Return an empty array in case of an error
  }
}

function getTotalPaidTickets() {
  try {
    const query = `
      SELECT COUNT(*) AS TotalPaidTickets
      FROM Ticket
      WHERE IsPaid ='Yes';
    `;

    const result = db.prepare(query).get(); // Execute the query
    return result.TotalPaidTickets; // Return the count of paid tickets
  } catch (err) {
    console.error("Error fetching total number of paid tickets:", err.message);
    return 0; // Return 0 if there is an error
  }
}

// *****************************************************************************************8
// Function to fetch all table names
function getAllTables() {
  const query = `
        SELECT name FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
    `;
  const tables = db.prepare(query).all();
  return tables.map((table) => table.name); // Return array of table names
}

// Function to fetch columns in a specific table
function getTableInfo(tableName) {
  const query = `PRAGMA table_info(${tableName});`;
  const tableInfo = db.prepare(query).all();
  return tableInfo;
}

// Display table structure
function displayTableStructures() {
  const tables = getAllTables();
  tables.forEach((table) => {
    console.log(`\nStructure of table: ${table}`);
    const columns = getTableInfo(table);
    columns.forEach((column) => {
      console.log(
        `Column: ${column.name}, Type: ${column.type}, NotNull: ${column.notnull}, Default: ${column.dflt_value}`,
      );
    });
    console.log("\n");
  });
}

function getAllData(tableName) {
  const query = `SELECT * FROM ${tableName};`;
  const rows = db.prepare(query).all();
  return rows;
}

// Display table data
function displayTableData(table) {
  const tab = getTableInfo(table);
  console.log(`\nData from table: ${tab}`);
  const data = getAllData(table);
  if (data.length > 0) {
    console.table(data); // Display data in tabular format
  } else {
    console.log(`No data found in ${table}`);
  }
}

// insertTicket({
//   CoachType: "Business",
//   TicketStatus: 1,
//   SeatNumber: 10,
//   IsPaid: "Yes",
//   TotalAmount: 100,
//   PersonID: 133331,
//   TripID: 1,
// });
// deletePassenger(12345);
// addAdmin(12345);
// console.log(getAllData("Train"));
// console.log(getAllData("Person"));
// console.log(getAllData("Passenger"));
// console.log(getScheduledUnpaidTickets())
// console.log(displayTableStructures());
// displayTableStructures();
// console.log(getDependentsByPersonID("1"));
// console.log(getAllData("Ticket"));
// insertTrip({
//   TripID: 18, // Ensure this is unique
//   sequenceNumber: 2,
//   arrivalTime: "2024-12-15 08:00:00",
//   departureTime: "2024-12-15 06:00:00",
//   price: 100,
//   availableSeats: 120,
//   distance: 300,
//   stationID: 1,
//   fromStationID: 2,
//   trainID: 1,
// });
// console.log(getAllData("WaitingList"));

// console.log(getScheduledUnpaidTickets());

module.exports = {
  usernameExists,
  emailExists,
  isAdmin,
  isPassenger,
  isStaff,
  getUserData,
  getRole,
  addPassenger,
  getScheduledUnpaidTickets,
  getActiveTrains,
  getTripsDetails,
  getDependentsByPersonID,
  getTrainCapacity,
  getAvailableSeats,
  getTrainIDByTripID,
  updateAvailableSeats,
  addToWaitingList,
  getDepartureTime,
  insertTicket,
  getTicketsByPersonId,
  updatePaymentStatus,
  deleteTicketById,
  getTotalTrains,
  getTotalPassengers,
  getTotalPaidTickets,
  getAllStaff,
  getTotalPendingTickets,
};
