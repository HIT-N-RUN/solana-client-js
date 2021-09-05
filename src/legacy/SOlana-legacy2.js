const { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { Connection, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { UInt } = require("buffer-layout");
const { TokenListProvider } = require('@solana/spl-token-registry');

const { Constant, ErrorMessage } = require('./config');
const { Wallet, Destination } = require('./Wallet');
const { Core, LAYOUT } = require('./Core');

/**
 * class for managing wallets and transfering tokens.
 */

 class Solana {
  /**
    * Create a new Solana Object
    * @param {string} url Mainnet url to connect
    */
  constructor(url = Constant.URL.MAINNET_BETA) {
    this.connection = new Connection(url);
    this.wallets = {}
    this.destinations = {}
    this.payers = {}
  }

  /**
    * Set token to transfer
    * @param {string} symbol Symbol name to set.
    */
  async setToken(symbol) {
    const provider = new TokenListProvider();
    const tokenList = (await provider.resolve()).getList();
    
    const target = tokenList.filter(target => target.symbol === symbol);

    if (target.length) {
      this.token = target[0];
    } else {
      throw new Error(symbol + " : " + ErrorMessage.NO_TOKEN_SYMBOLE_NAME);
    }
  }

  /**
    * Set mainnet url
    * If new url is same with original url, it will not change anything.
    * @param {string} newURL Mainnet url to change
    */
  setMainNetURL(newURL) {
    if (this.connection._rpcEndpoint === newURL) {
      return;
    }

    this.connection = new Connection(newURL);
  }

  /**
   * store wallet at this object.
   * @param {string} name Wallet name to set. It will be used to get wallet's infoes and transfer tokens.
   * @param {Uint8Array} secretKeyArray Wallet's secretKey Array.
   */
  async addWallet(name, secretKey) {
    const wallet = new Wallet(name, secretKey);
    const associatedAddress = await this.getAssociatedTokenAddress(wallet.publicKey);

    wallet.setAssociatedAddress(associatedAddress);

    this.wallets[name] = wallet
  }

  /**
   * store payer wallet at this object.
   * @param {string} name Wallet name to set.
   * @param {Uint8Array} secretKeyArray Wallet's secretKey Array.
   */
  async addPayer(name, secretKey) {
    const wallet = new Wallet(name, secretKey);
    const associatedAddress = await this.getAssociatedTokenAddress(wallet.publicKey);

    wallet.setAssociatedAddress(associatedAddress);

    this.payers[name] = wallet
  }

  /**
   * store destination's publicKey at this object.
   * @param {string} name destination name to set. It will be used to transfer tokens.
   * @param {string} destination destination's publicKey
   */
  async addDestination(name, publicKey) {
    const destination = new Destination(name, publicKey);
    const associatedAddress = await this.getAssociatedTokenAddress(destination.publicKey);

    destination.setAssociatedAddress(associatedAddress);

    this.destinations[name] = destination;
  }

  /**
   * get wallet balance. Token balance is default.
   * @param {string} name wallet name to derive balance
   * @param {boolean} associated false if u want to get SOL balance
   * @returns 
   */
  async getWalletBalance(name, associated=true) {
    const wallet = this.wallets[name]
    var balance;

    if (associated) {
      const address = wallet.associatedAddress;
      
      balance = await this.connection.getTokenAccountBalance(address);
    } else {
      const address = wallet.publicKey;
      
      balance = await this.connection.getBalance(address);
    }

    return balance;
  }

  /**
   * get AssociatedTokenAddress from publicKey
   * @param {string} publicKey publicKey to derive associated token address 
   * @returns {string} associated token Address
   */
  async getAssociatedTokenAddress(publicKey) {
    const mint = new PublicKey(this.token.address);
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, publicKey
    )
    
    return associatedTokenAddress;
  }

  /**
   * get TransferTokenInstruction
   * @returns transferInstruction
   */
  getTransferTokenInstruction({ walletName, destinationName, amount }) {
    const sender = this.wallets[walletName];
    const destination = this.destinations[destinationName];

    const mint = new PublicKey(this.token.address);
    const decimals = this.token.decimals;

    const keys = [
      { pubkey: sender.associatedAddress, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination.associatedAddress, isSigner: false, isWritable: true },
      { pubkey: sender.keyPair.publicKey, isSigner: true, isWritable: false }
    ]
    const programId = TOKEN_PROGRAM_ID;
    const data = LAYOUT.encodeTokenInstructionData({
      transferChecked: { amount, decimals }
    });

    const transferIx = new TransactionInstruction({ keys, programId, data });

    return transferIx
  }

  /**
   * 
   * @param {{sender: String, destination: String, amount: UInt, mint: String}[]} instructions
   * walletName: sender's walletName
   * 
   * destinationName: receiver's Name
   * 
   * amount: amount of tokens to transfer
   * @param {string} payer wallet name for pay (should stored in this object)
   * @returns transaction's Signature
   */
  async transferTokens(instructions, payerName) {
    const transaction = new Transaction();

    // Add all instructions in one transaction.
    for (let i = 0; i < instructions.length; i++) {
      const transferIx = this.getTransferTokenInstruction(instructions[i]);

      transaction.add(transferIx);
    }

    transaction.recentBlockhash = (await this.connection.getRecentBlockhash('max')).blockhash;

    // Get sender's unique keyPair sets.
    const owners = Core.getSetOfWallets(instructions);
    
    const ownersKeyPair = owners.map(owner => this.wallets[owner].keyPair);

    // Get fee payer's wallet and set as fee payer
    const feePayer = this.payers[payerName].keyPair;
    transaction.setSigners(feePayer.publicKey);

    // Partial sign
    transaction.partialSign(feePayer, ...ownersKeyPair);

    const rawTransaction = transaction.serialize();

    return await this.connection.sendRawTransaction(rawTransaction);
  }
}

module.exports = Solana;