const { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');

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

class Solana {
  constructor(config = {}) {
    const MAINNET_URL = config.MAINNET_URL ? config.MAINNET_URL : Constant.SERUM_PROJECT_URL;

    this.connection = new Connection(MAINNET_URL);
    this.wallets = {}
    this.destinations = {}
    this.mint = config.MINT ? new PublicKey(config.MINT) : new PublicKey(Constant.SGT.MINT_ADDRESS);
    this.decimals = config.DECIMALS ? config.DECIMALS : Constant.SGT.DECIMALS;
  }

  changeMainNetURL(url) {
    if (this.connection._rpcEndpoint === url) {
      return;
    } else {
      this.connection = new Connection(url);
    }
  }

  addWallet(name, secretKeyArray) {
    this.wallets[name] = new Wallet(name, secretKeyArray);
  }

  addDestination(name, destination) {
    this.destinations[name] = new Destination(name, destination);
  }

  async getAssociatedTokenAddress(publicKey, mint) {
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, publicKey
    )
    return associatedTokenAddress;
  }

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

  async transferTokens(instructions, feeWallet) {
    const transaction = new Transaction();

    for (let i = 0; i < instructions.length; i++) {
      const transferIx = await this.getTransferTokenInstruction(instructions[i]);

      transaction.add(transferIx);
    }

    transaction.recentBlockhash = (await this.connection.getRecentBlockhash('max')).blockhash;

    const owner = this.wallets[instructions[0].walletName].keyPair;
    const owner2 = this.wallets[instructions[5].walletName].keyPair;

    const feePayer = this.wallets[feeWallet].keyPair;
    
    transaction.setSigners(feePayer.publicKey);
    transaction.partialSign(feePayer, owner, owner2);

    const rawTransaction = transaction.serialize();

    return await this.connection.sendRawTransaction(rawTransaction);
  }
}

module.exports = Solana;