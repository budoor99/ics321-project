const db = require("better-sqlite3")("train system1.db");

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
  return result?.Role === "Admin";
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
  return result?.Role === "Driver" || result?.Role === "Engineer";
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
  if (isPassenger(username)) return "Passenger";
  else if (isStaff(username)) return isStaff(username).Role;
  else if (isAdmin(username)) return isAdmin(username).Role;
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
            a.Username
        FROM 
            Account a
        JOIN 
            Person p ON a.PersonID = p.PersonID
        JOIN 
            Passenger ps ON p.PersonID = ps.PersonID
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

function insertTicket(ticket) {
  const query = `
        INSERT INTO Ticket (CoachType, TicketStatus, SeatNumber, IsPaid, TotalAmount, PersonID, TripID)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

  const stmt = db.prepare(query);

  const result = stmt.run(
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

function insertTrip({
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
  const query = `
        INSERT INTO Trip 
        (SequenceNumber, ArrivalTime, DepartureTime, Price, AvailableSeats, Distance, StationID, FROMStationID, TrainID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  const stmt = db.prepare(query);
  const result = stmt.run(
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
  return result.lastInsertRowid;
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

// const tripData = {
//     sequenceNumber: 1, // Ensure this is defined
//     arrivalTime: "2024-12-11T14:00:00",
//     departureTime: "2024-12-11T12:00:00",
//     price: 100,
//     availableSeats: 50,
//     distance: 200,
//     stationID: 2,
//     fromStationID: 1,
//     trainID: 1,
// };
// insertTrip(tripData);

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
            t.IsPaid = 0; -- Only fetch unpaid tickets
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
        tr.StationID
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

function getDependentsByPersonID(personID) {
  const sql = `
        SELECT Name, Relationship, PersonID
        FROM Dependent
        WHERE PersonID = ?;
    `;
  const dependents = db.prepare(sql).all(personID); // Execute the query
  return dependents;
}

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
// console.log(getAllData("Person"));
// console.log(getAllData("Dependent"));
// console.log(getScheduledUnpaidTickets())
// console.log(displayTableStructures());
// displayTableStructures();
// console.log(getDependentsByPersonID("1"));

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
};
