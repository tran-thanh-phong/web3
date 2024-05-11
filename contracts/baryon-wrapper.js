const ethers = require('ethers');
const BARYON_ROUTER_ABI = require('./baryon-router-abi.json');


// Define the contract address and ABI (Application Binary Interface)
const contractAddress = "0x67807b9f5B9757C0c79347F0b3f360C15c5E6aFF"; // BaryonRouter
const contractABI = BARYON_ROUTER_ABI;

async function swapExactETHForTokens(wallet) {
    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    
    // Define the function name and parameters
    var now = Math.round(Date.now() / 1000) + 60;
    const functionName = "swapExactETHForTokens"; // Replace with your function name
    const functionParams = [
        15, 
        ['0x4200000000000000000000000000000000000006', '0x38bb7b9b87bdfbed883aaf50a2f411d330fe32d6'], // WETH / HAIRY
        wallet.address, 
        now
    ];
    
    // Override options to specify gas limit and value
    const overrides = {
        gasLimit: 150_000, // Adjust the gas limit as needed
        //gasPrice: ethers.parseUnits("0.001000252", "gwei"),
        value: ethers.parseEther("0.0000001") // Amount of ETH to attach - 100_000_000_000
    };
    
    console.log(overrides);
    try {
      var hash = await callWriteFunction(contract, functionName, functionParams, overrides);
      return hash;
    } catch (err) {
      console.log(err);
    }
    
    return null;
}

// Define the function to call the write method
async function callWriteFunction(contract, functionName, functionParams, overrides) {
  try {
    // Send the transaction
    const tx = await contract[functionName](...functionParams, overrides);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Transaction successful txid:", receipt.hash);
    return receipt;
  } catch (error) {
    console.error("Error calling write function:", error);
    return null;
  }
}

module.exports = { swapExactETHForTokens };