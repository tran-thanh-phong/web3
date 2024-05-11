const ethers = require('ethers');
const fs = require('fs');
const XLSX = require('xlsx');

// Function to generate wallet details
function generateWalletDetails() {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return {
        address: wallet.address,
        phrase: mnemonic,
        privateKey: wallet.privateKey
    };
}

// Create an array to hold wallet details
const walletDetails = [];

// Generate 10 wallet details for example
for (let i = 0; i < 4000; i++) {
    walletDetails.push(generateWalletDetails());
}

// Convert wallet details to Excel format
const ws = XLSX.utils.json_to_sheet(walletDetails);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Wallets');
const excelFilePath = 'wallets.xlsx';

// Write to Excel file
XLSX.writeFile(wb, excelFilePath);

console.log(`Wallet details have been written to ${excelFilePath}`);
