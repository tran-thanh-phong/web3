const { parentPort } = require('worker_threads');
const { execGetTransactionDetails, getBalance, swapHairyFromEth, printBalances } = require('../utils/ethUtils');

//execGetTransactionDetails("0xba915f0885df85b17a5678f1cd4c98dd3031a02c77443ffc9846c700b39c2d60");

async function performBalanceTask(data) {
    const balance = await getBalance(data?.Id);
    return balance;
}
  
async function performTask(data) {
    const txid = await swapHairyFromEth(data);
    return txid;
}

parentPort.on('message', async (message) => {
    try {
        const start = Date.now();

        const result = await performTask(message);

        const end = Date.now();

        const response = {
            data: result,
            time: end - start
        };

        parentPort.postMessage(response); // Send the result back to the parent
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});