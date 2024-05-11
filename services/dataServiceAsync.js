const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Open the SQLite database
const db = new sqlite3.Database('app.db');

// Promisify the database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbClose = promisify(db.close.bind(db));

function getDb() {
  return new sqlite3.Database('app.db');
}

function getDbRun() {
  return promisify(getDb().run.bind(db));
}

// Execute Query
async function executeDbAll(sql, params) {
  try {
    const rows = await dbAll(sql, [...params]);
    return rows;
  } catch (error) {
    console.error('Error performing database operations:', error);
  } finally {
    //await dbClose();
  }
}

async function executeDbRun(sql, params) {
  try {
    await dbRun(sql, [...params]);
  } catch (error) {
    console.error('Error performing database operations:', error);
  } finally {

  }
}

async function getWalletsByCategory(category) {
  const sql = 'SELECT * FROM Wallets WHERE Category = ? ORDER BY CategoryOrder';
  const params = [category];
  
  var data = await executeDbAll(sql, params);
  return data;
}

async function getWalletsByIds(ids) {
  const placeholders = ids.map(() => '?').join(',');
  const sql = `SELECT * FROM Wallets WHERE Id IN (${placeholders}) ORDER BY CategoryOrder`;
  const params = ids;
  
  var data = await executeDbAll(sql, params);
  return data;
}

async function updateWalletBalances(walletId, ethAmount, hairyAmount, mode) {
  var ethAmountCol = "EthAmount";
  var hairyAmountCol = "HairyAmount";

  if (mode == 2) {
      ethAmountCol += "2";
      hairyAmountCol += "2";
  }

  const sql = `UPDATE Wallets SET ${ethAmountCol} = ?, ${hairyAmountCol} = ?, LastUpdated = ? WHERE Id = ?`;
  
  const params = [ethAmount, hairyAmount, new Date().toISOString(), walletId];

  await executeDbRun(sql, params);    
}

async function updateLatestTransaction(walletId, tranxId, tranxFee, gasPrice, gasUsage, callback) {
  const sql = 'UPDATE Wallets SET TranxId = ?, TranxFee = ?, GasPrice = ?, GasUsage = ?, LastUpdated = ? WHERE Id = ?';
  const params = [tranxId, tranxFee, gasPrice, gasUsage, new Date().toISOString(), walletId];

  await executeDbRun(sql, params);    
}

////////////////////// TESTING ////////////////////// 
async function exec() {
  // const sql = 'SELECT * FROM Wallets WHERE Category = ?';
  // const params = ['Self700'];
  
  // var data = await executeQuery(sql, params);
  // var data = await getWalletsByCategory('Self700');
  // var data = await updateWalletBalances('0x5A1F6D1520908E982BEF461c6E7e60E23Bf3cB6a', 0.0000024, 0, 1);
  // console.log(data);
  
  // data = await updateWalletBalances('0x5A1F6D1520908E982BEF461c6E7e60E23Bf3cB6a', null, null, 2);
  // console.log(data);

  var data = await getWalletsByIds(['0xcFC1D304EA1F80110159e9cC298083E8Aa04779d', '0x9cB4c92bc36911E2AAd62D4373b06B98a1028E9B', '0x9B41519bCA02e0D194e1d67d6cBFE76C57538305', '0xE45D2FE93E977Ae4277303C5BEa80F4047049c7F']);
  console.log(data);
}

// exec();

////////////////////// TESTING //////////////////////

module.exports = { executeDbAll, getWalletsByCategory, getWalletsByIds, updateWalletBalances, updateLatestTransaction };
