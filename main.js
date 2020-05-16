const{Blockchain ,Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('5a9f8e5d9072020d3a00d621a436a48d1f7efd945c675b43e5068ab8c3e45197');
const myWalletAddress = myKey.getPublic('hex');


let Kcoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress,'public Key goes here', 0);
tx1.signTransaction(myKey);
Kcoin.addTransaction(tx1);

console.log('\n Starting the miner...');
Kcoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Arnold is', Kcoin.getBalanceOfAddress(myWalletAddress));
