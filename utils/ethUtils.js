// 1. Import ethers
const ethers = require('ethers');

// 2. Define network configurations
const providerRPCVIC = {
  mainnet: {
    name: 'Viction-mainnet',
    rpc: 'https://rpc.viction.xyz', // Insert your RPC URL here
    chainId: 88,
  },
};

const providerRPCA8 = {
    mainnet: {
      name: 'Ancient8 Mainnet',
      rpc: 'https://rpc.ancient8.gg', // Insert your RPC URL here
      chainId: 888888888,
    },
  };

const providerRPC = providerRPCA8;

// 3. Create ethers provider
const provider = new ethers.JsonRpcProvider(providerRPC.mainnet.rpc, {
  chainId: providerRPC.mainnet.chainId,
  name: providerRPC.mainnet.name, 
});


// Step 3: List of Ethereum addresses
const addresses = [
    '0x13e66f9dACCE4073321A2867ddF4f583e69e3FcC',
];

const privateKeys = [
    
];

const receivedAddress = '0x854F4969A11fB73f2553003a08bb0F453cE96d81';

// Create balances function
const getBalance = async (address) => {
    // Fetch balances
    const balance = ethers.formatEther(
      await provider.getBalance(address)
    );
    
    return balance;
  };
  
// Step 4: Function to get balance
async function getBalances(addresses) {
    for (const address of addresses) {
        try {
            var balance = await getBalance(address);
            
            console.log(`The balance of ${address} is: ${balance} VIC`);
        } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error);
        }
    }
}

// Create send function
const send = async (addressFrom, privateKeyFrom, addressTo, sentAmount) => {
    sentAmount = sentAmount.toString();
    console.log(
      `Attempting to send a transferred transaction of ${sentAmount} VIC from ${addressFrom} to ${addressTo}`
    );
  
    const wallet = new ethers.Wallet(privateKeyFrom, provider);

    // Create transaction
    const tx = {
      to: addressTo,
      value: ethers.parseEther(sentAmount),
    };
  
    // Send transaction and get hash
    const createReceipt = await wallet.sendTransaction(tx);
    await createReceipt.wait();
    console.log(`Transaction successful with hash: ${createReceipt.hash}`);
};

async function collectBalances(addresses, keys, receivedAddress, keptBalance) {
    for (var i = 0; i < addresses.length; i++) {
        try {
            var address = addresses[i];
            var key = keys[i];
        
            // 1. Get balance
            var balance = await getBalance(address);
            console.log(`The balance of ${address} is: ${balance} VIC`);

            // 2. Check & continue
            if (balance <= keptBalance) {
                continue;
            }

            // 3. Tranfer
            balance -= keptBalance;
            await send(address, key, receivedAddress, balance);

            // 4. Recheck balance
            balance = await getBalance(address);
            console.log(`The balance of ${address} is: ${balance} VIC`);
        } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error);
        }
    }
}

///////////////////// Calling smart contract /////////////////////
const { swapExactETHForTokens } = require('../contracts/baryon-wrapper');
const { getTokenBalance } = require('../contracts/hairy-token-wrapper');
const { getDataFromTable, updateWalletBalancesAsync } = require('../services/dataService');
const { updateWalletBalances, updateLatestTransaction } = require('../services/dataServiceAsync');
const { getTransactionDetails } = require('./transactionUtils');

// // Usage example
// getDataFromTable(data => {
//   //console.log(data); // Array of YourDataObject objects

//   let d = data.filter(x => x.Id == "0x09388d5c6f4B97eE309698e86d7B3f9eca0DaCbb");
  
//   d.forEach(wallet => {
//     process(wallet);
//   });
// });

async function swapHairyFromEth(wallet) {
  // Check wallet
  var ethAmount = await getBalance(wallet.Id);

  var hairyAmount = await getTokenBalance(provider, wallet.Id); 
  console.log(`${wallet.Id}: ${ethAmount} ETH, ${hairyAmount} HAIRY`);

  // Update db - Before
  await updateWalletBalances(wallet.Id, ethAmount, hairyAmount, 1);

  if (ethAmount < 0.000002) {
    return `${ethAmount} ETH`;
  }

  // Swap ETH to HAIRY
  const wallet3 = new ethers.Wallet(wallet.PrivateKey, provider);
  const tranx = await swapExactETHForTokens(wallet3);
  console.log(wallet.Id, tranx?.hash);

  if (tranx?.hash) {
    const tranxFee = tranx.gasPrice * tranx.gasUsed;
    await updateLatestTransaction(wallet.Id, tranx.hash, tranxFee, tranx.gasPrice, tranx.gasUsed);
  }

  return tranx?.hash;

  // Update db - After 60 sec
  // setTimeout(() => {
  //   updateWalletBalances(wallet.Id, ethAmount, hairyAmount, 2, (err, numRowsAffected) => {
  //     if (err) {
  //         console.error('updateWalletBalances - Error updating database:', err);
  //     } else {
  //         console.log('updateWalletBalances - Affected rows:', numRowsAffected);
  //     }
  //   });
  // }, 60000);
}

async function execGetTransactionDetails(txid) {
  var tranx = await getTransactionDetails(provider, txid);
  console.log(tranx);
}

async function getAllBalances(address) {
    var ethAmount = await getBalance(address);
  
    var hairyAmount = await getTokenBalance(provider, address); 

    return [{
            unit: 'ETH',
            amount: ethAmount
        },{
            unit: 'HAIRY',
            amount: hairyAmount
        }
    ];
  }
  
  async function printBalances(wallet) {
    const balances = await getAllBalances(wallet.Id);
    console.log(`[${wallet.Category}][${wallet.CategoryOrder}] ${wallet.Id}: ${JSON.stringify(balances)}`);
  }
///////////////////// Step 5: Execute the function /////////////////////
//getBalances(addresses);

// collectBalances(addresses, privateKeys, receivedAddress, 0.01);


// Execute the function
// const wallet = new ethers.Wallet('0xe827a1271b02463f0ddf616d7d4fb425cad62d0c72c78a7ad65622f7703874dc', provider);
// swapExactETHForTokens(wallet);

//execGetTransactionDetails("0xba915f0885df85b17a5678f1cd4c98dd3031a02c77443ffc9846c700b39c2d60");

module.exports = { getBalance, getAllBalances, execGetTransactionDetails, swapHairyFromEth, printBalances };