const ethers = require('ethers');
const HAIRY_TOKEN_ABI = require('./hairy-token-abi.json');


// Define the contract address and ABI (Application Binary Interface)
const contractAddress = "0x38bB7B9B87BdfBEd883aAf50A2f411d330FE32D6"; // Hairy Token
const contractABI = HAIRY_TOKEN_ABI;

// Get the balance of the address
async function getTokenBalance(provider, addressToCheck) {
  const tokenContract = new ethers.Contract(contractAddress, contractABI, provider);
  
  let balance = await tokenContract.balanceOf(addressToCheck);
  balance = ethers.formatEther(balance);
  return balance;
}

module.exports = { getTokenBalance };