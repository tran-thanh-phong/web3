const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const XLSX = require('xlsx');

// Open the SQLite database
const db = new sqlite3.Database('app.db');

// Promisify the database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Load Excel file
const workbook = XLSX.readFile('wallets.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Asynchronous function to perform database operations
async function initializeDatabase() {
  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS Wallets (
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
    )`);
  } catch (error) {
    console.error('Error performing database operations:', error);
  } finally {
    // Close the database
    db.close((err) => {
      if (err) {
          console.error('Error closing the database:', err);
      } else {
          console.log('Database closed.');
      }
    });
  }
}

async function insertOrUpdateDataFromExcel() {
  try {
    const selectSql = "SELECT * FROM Wallets WHERE id = ?";
    const insertSql = "INSERT INTO wallets (Id, PrivateKey, SeedPhrase, Category, CategoryOrder) VALUES (?, ?, ?, ?, ?)";
    const updateSql = "UPDATE wallets SET Category = ?, CategoryOrder = ? WHERE Id = ?";

    // Iterate over Excel rows and insert data into SQLite table
    let row = 4001; // Assuming data starts from row 2
    while (worksheet[`A${row}`]) {
        const address = worksheet[`A${row}`].v?.toLowerCase().trim();
        const phrase = worksheet[`B${row}`].v;
        const privateKey = worksheet[`C${row}`].v;
        const category = worksheet[`D${row}`]?.v;
        const order = worksheet[`E${row}`]?.v;

        var wallet = await dbGet(selectSql, [address])
        var log = 'Inserted';

        if (wallet) {
          await dbRun(updateSql, category, order, address);
          log = 'Updated';
        } else {
          await dbRun(insertSql, address, privateKey, phrase, category, order);
        }

        row++;
        console.log(`Row no: #${row} - Address: ${address} - ${log}`);
    }
  } catch (error) {
    console.error('Error performing database operations:', error);
  } finally {
    // Close the database
    db.close((err) => {
      if (err) {
          console.error('Error closing the database:', err);
      } else {
          console.log('Database closed.');
      }
    });
  }
}

async function run() {
  //await initializeDatabase();
  await insertOrUpdateDataFromExcel();
}

run();