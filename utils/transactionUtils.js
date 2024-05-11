// Import ethers.js library
const { ethers } = require("ethers");

// Function to get transaction details by txid
async function getTransactionDetails(provider, txid) {
    try {
        // Fetch transaction details
        const transaction = await provider.getTransaction(txid);

        return transaction;
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        return null;
    }
}

module.exports = { getTransactionDetails };