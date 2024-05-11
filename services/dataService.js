const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Connect to SQLite database
const db = new sqlite3.Database('app.db');

// Promisify the database run and all methods
// const dbRun = promisify(db.run.bind(db));
// const dbGet = promisify(db.get.bind(db));
// const dbAll = promisify(db.all.bind(db));

// Define a class to represent your data structure
class Wallet {
    constructor(Id, PrivateKey, SeedPhrase, Category, CategoryOrder, EthAmount, HairyAmount, LastUpdated) {
        this.Id = Id;
        this.PrivateKey = PrivateKey;
        this.SeedPhrase = SeedPhrase;
        this.Category = Category;
        this.CategoryOrder = CategoryOrder;
        this.EthAmount = EthAmount;
        this.HairyAmount = HairyAmount;
        this.LastUpdated = LastUpdated;
    }
}

// Function to retrieve data from SQLite and store them as objects in an array
function getDataFromTable(callback) {
    const data = [];
    db.all('SELECT Id, PrivateKey, SeedPhrase, Category, CategoryOrder, EthAmount, HairyAmount, LastUpdated FROM Wallets', (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err);
            callback([]);
            return;
        }
        
        // Map retrieved rows to objects
        rows.forEach(row => {
            const { Id, PrivateKey, SeedPhrase, Category, CategoryOrder, EthAmount, HairyAmount, LastUpdated } = row;
            const obj = new Wallet(Id, PrivateKey, SeedPhrase, Category, CategoryOrder, EthAmount, HairyAmount, LastUpdated);
            data.push(obj);
        });

        callback(data);

        // Close database connection when done
        db.close();
    });
}

// Function to perform an SQL update statement
function runUpdateStatement(databasePath, sql, params, callback) {
    let db = new sqlite3.Database(databasePath);

    db.run(sql, params, function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null, this.changes); // Pass the number of affected rows to the callback
        }
    });

    db.close();
}

async function runUpdateStatementAsync(databasePath, sql, params) {
    try {
        let db = new sqlite3.Database(databasePath);
        const dbRun = promisify(db.run.bind(db));
        
        await dbRun(sql, params);
    } catch (error) {
        console.error('Error performing database operations:', error);
    } finally {
        // Close the database
        db.close();
    }
}

// Example usage:
const databasePath = 'app.db';

function updateWalletBalances(walletId, ethAmount, hairyAmount, mode, callback) {
    var ethAmountCol = "EthAmount";
    var hairyAmountCol = "HairyAmount";

    if (mode == 2) {
        ethAmountCol += "2";
        hairyAmountCol += "2";
    }

    const sql = `UPDATE Wallets SET ${ethAmountCol} = ?, ${hairyAmountCol} = ?, LastUpdated = ? WHERE Id = ?`;
    
    const params = [ethAmount, hairyAmount, new Date().toISOString(), walletId];

    runUpdateStatement(databasePath, sql, params, (err, numRowsAffected) => {
        callback(err, numRowsAffected);
    });    
}

async function updateWalletBalancesAsync(walletId, ethAmount, hairyAmount, mode) {
    var ethAmountCol = "EthAmount";
    var hairyAmountCol = "HairyAmount";

    if (mode == 2) {
        ethAmountCol += "2";
        hairyAmountCol += "2";
    }

    const sql = `UPDATE Wallets SET ${ethAmountCol} = ?, ${hairyAmountCol} = ?, LastUpdated = ? WHERE Id = ?`;
    
    const params = [ethAmount, hairyAmount, new Date().toISOString(), walletId];

    await runUpdateStatementAsync(databasePath, sql, params);    
}

function updateLatestTransaction(walletId, tranxId, tranxFee, gasPrice, gasUsage, callback) {
    const sql = 'UPDATE Wallets SET TranxId = ?, TranxFee = ?, GasPrice = ?, GasUsage = ?, LastUpdated = ? WHERE Id = ?';
    const params = [tranxId, tranxFee, gasPrice, gasUsage, new Date().toISOString(), walletId];

    runUpdateStatement(databasePath, sql, params, (err, numRowsAffected) => {
        callback(err, numRowsAffected);
    });    
}

module.exports = { getDataFromTable, updateWalletBalances, updateWalletBalancesAsync, updateLatestTransaction };

// // Usage example
// getDataFromTable(data => {
//     console.log(data); // Array of YourDataObject objects
// });


