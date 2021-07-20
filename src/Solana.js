const { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { UInt } = require("buffer-layout");

const { Constant, LAYOUT } = require('./config');

class Wallet {
  constructor(name, secretKeyArray) {
    this.name = name;

    this.keyPair = Keypair.fromSecretKey(Buffer.from(secretKeyArray));

    this.publicKey = this.keyPair.publicKey;
    this.secretKey = this.keyPair.secretKey;
  }
}

class Destination {
  constructor(name, publicKey) {
    this.name = name;
    this.publicKey = new PublicKey(publicKey);
  }
}

class Core {
  static getSetOfWallets(instructions) {
    const walletNames = instructions.map(instruction => instruction.walletName);

    const setOfWallets = [...new Set(walletNames)]
   
    return setOfWallets;
  }
}

/**
 * class for managing wallets and transfering tokens.
 */

class Solana {
  /**
    * Create a new Solana Object
    * @param {string} url Mainnet url to connect
    * @param {string} mint Token mint address to transfer
    * @param {number} decimals Token decimals to transfer
    */
  constructor(url, mint, decimals) {
    this.connection = new Connection(url ? url : Constant.MAINNET_BETA_URL);
    this.wallets = {}
    this.destinations = {}
    this.mint = mint ? new PublicKey(mint) : new PublicKey(Constant.SGT.MINT_ADDRESS);
    this.decimals = decimals ? decimals : Constant.SGT.DECIMALS;
  }

  /**
    * Change mainnet url
    * If new url is same with original url, it will not change anything.
    * @param {string} newUrl Mainnet url to change
    */
  changeMainNetURL(newUrl) {
    if (this.connection._rpcEndpoint === newUrl) {
      return;
    }

    this.connection = new Connection(newUrl);
  }

  /**
   * store wallet at this object.
   * @param {string} name Wallet name to set. It will be used to get wallet's infoes and transfer tokens.
   * @param {Uint8Array} secretKeyArray Wallet's secretKey Array.
   */
  addWallet(name, secretKeyArray) {
    this.wallets[name] = new Wallet(name, secretKeyArray);
  }

  /**
   * store destination's publicKey at this object.
   * @param {string} name destination name to set. It will be used to transfer tokens.
   * @param {string} destination destination's publicKey
   */
  addDestination(name, destination) {
    this.destinations[name] = new Destination(name, destination);
  }

  /**
   * get AssociatedTokenAddress from publicKey
   * @param {string} publicKey publicKey to derive associated token address
   * @param {string} mint mint address to derive 
   * @returns {string} associated token Address
   */
  async getAssociatedTokenAddress(publicKey, mint) {
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, publicKey
    )
    return associatedTokenAddress;
  }

  /**
   * get TransferTokenInstruction
   * @returns transferInstruction
   */
  async getTransferTokenInstruction({ walletName, destinationName, amount }) {
    const owner = this.wallets[walletName].keyPair;
    const destination = this.destinations[destinationName].publicKey;

    const mint = this.mint;

    const keys = [
      { pubkey: await this.getAssociatedTokenAddress(owner.publicKey, mint), isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: await this.getAssociatedTokenAddress(destination, mint), isSigner: false, isWritable: true },
      { pubkey: owner.publicKey, isSigner: true, isWritable: false }
    ]
    const programId = TOKEN_PROGRAM_ID;
    const data = LAYOUT.encodeTokenInstructionData({
      transferChecked: { amount, decimals: this.decimals }
    });

    const transferIx = new TransactionInstruction({ keys, programId, data });

    return transferIx
  }

  /**
   * 
   * @param {{walletName: string, destinationName: string, amount: UInt}[]} instructions
   * walletName: sender's walletName
   * 
   * destinationName: receiver's Name
   * 
   * amount: amount of tokens to transfer
   * @param {string} feeWallet wallet name for pay (should stored in this object)
   * @returns transaction's Signature
   */
  async transferTokens(instructions, feeWallet) {
    const transaction = new Transaction();

    // Add all instructions in one transaction.
    for (let i = 0; i < instructions.length; i++) {
      const transferIx = await this.getTransferTokenInstruction(instructions[i]);

      transaction.add(transferIx);
    }

    transaction.recentBlockhash = (await this.connection.getRecentBlockhash('max')).blockhash;

    // Get sender's unique keyPair sets.
    const owners = Core.getSetOfWallets(instructions);
    const ownersKeyPair = owners.map(owner => this.wallets[owner].keyPair);

    // Get fee payer's wallet and set as fee payer
    const feePayer = this.wallets[feeWallet].keyPair;
    transaction.setSigners(feePayer.publicKey);

    // Partial sign
    transaction.partialSign(feePayer, ...ownersKeyPair);

    const rawTransaction = transaction.serialize();

    return await this.connection.sendRawTransaction(rawTransaction);
  }
}

module.exports = Solana;