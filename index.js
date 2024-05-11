const { execGetTransactionDetails, getBalance, getAllBalances, swapHairyFromEth, printBalances } = require('./utils/ethUtils');
const { getWalletsByCategory, getWalletsByIds } = require('./services/dataServiceAsync');

//execGetTransactionDetails("0xba915f0885df85b17a5678f1cd4c98dd3031a02c77443ffc9846c700b39c2d60");

async function swapHairy() {
  //var data = await getWalletsByCategory('Self700');
  var data = await getWalletsByIds(['0xcfc1d304ea1f80110159e9cc298083e8aa04779d', '0x9cb4c92bc36911e2aad62d4373b06b98a1028e9b', '0x9b41519bca02e0d194e1d67d6cbfe76c57538305', '0xe45d2fe93e977ae4277303c5bea80f4047049c7f']);

  // Top 10
  data = data.slice(0, 10);
  
  data.forEach(async wallet => {
    //await printBalances(wallet);
    await swapHairyFromEth(wallet);
  });
}

swapHairy();