const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');

// Open the SQLite database
const db = new sqlite3.Database('app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
  }
});

// Load Excel file
const workbook = XLSX.readFile('wallets.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Create the table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Wallets (
    Id TEXT PRIMARY KEY,
    PrivateKey TEXT NOT NULL UNIQUE,
    SeedPhrase TEXT NOT NULL UNIQUE,
    Category TEXT NULL,
    CategoryOrder INTEGER NULL,
    EthAmount REAL NULL,
    HairyAmount REAL NULL,
    EthAmount2 REAL NULL,
    HairyAmount2 REAL NULL,
    TranxId TEXT NULL,
    TranxFee REAL NULL,
    TranxValue REAL NULL,
    TranxTotal REAL NULL,
    GasPrice REAL NULL,
    GasUsage REAL NULL,
    LastUpdated TEXT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "wallets" created or already exists.');
    }
  });
});

db.serialize(() => {
    // Prepare SQLite statement for insertion
    const stmt = db.prepare(`INSERT INTO wallets (Id, PrivateKey, SeedPhrase, Category, CategoryOrder) VALUES (?, ?, ?, ?, ?)`);
    const stmtUpdate = db.prepare(`UPDATE wallets SET Category = ?, CategoryOrder = ? WHERE Id = ?`);

    // Iterate over Excel rows and insert data into SQLite table
    let row = 2; // Assuming data starts from row 2
    while (worksheet[`A${row}`]) {
        const address = worksheet[`A${row}`].v;
        const phrase = worksheet[`B${row}`].v;
        const privateKey = worksheet[`C${row}`].v;
        const category = worksheet[`D${row}`]?.value;
        const order = worksheet[`E${row}`]?.value;

        db.get(`SELECT * FROM Wallets WHERE id = ?`, [address], (err, row) => {
          if (err) {
              return console.error('Error fetching user by ID:', err.message);
          }

          if (row) {
            stmtUpdate.run(address, category, order);
          } else {
            stmt.run(address, privateKey, phrase, category, order);
          }
        });

        row++;
    }

    // Finalize statement and close database connection
    stmt.finalize(() => {
        console.log('Data imported successfully.');
        db.close();
    });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
