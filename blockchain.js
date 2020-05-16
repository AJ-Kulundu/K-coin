const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash(){
      return SHA256(this.fromAddress + this.toAddress + this.amount).toString();  
    }
    signTransaction(signinKey){
        if(signinKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

     const hashTx = this.calculateHash();
     const sig = signinKey.sign(hashTx,'base64');
     this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null ) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publickey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publickey.verify(this.calculateHash(), this.signature);
    }
}
class Block{
    constructor(timestamp, transaction, previousHash=''){   
        this.timestamp= timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash= this.calculateHash(); 
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.transaction + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
              this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined = '+ this.hash);
    }
    hasValidTransactions(){
        for(const tx of this.transaction){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 110;
    }
    createGenesisBlock(){
        return new Block("25/3/2020","Genesis","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length -1 ];
    }
    minePendingTransactions(miningRewardAddress){
     let block = new Block(Date.now(), this.pendingTransactions);
     block.mineBlock(this.difficulty);

     console.log('Block successfully mined!');
     this.chain.push(block);

     this.pendingTransactions = [];
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot Add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transaction){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount
                }
            }
        }
        return balance;
    }

    ischainValid(){
        for(let i =  1; i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash != previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}
module.exports.Blockchain= Blockchain;
module.exports.Transaction=Transaction;