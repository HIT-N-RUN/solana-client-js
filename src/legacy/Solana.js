const { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  TransactionInstruction
} = require('@solana/web3.js');

const { LAYOUT } = require('./constant');

class Solana {
  constructor() {
    this.MAINNET_URL = 'https://solana-api.projectserum.com';
    this.connection = new Connection(this.MAINNET_URL);
  }

  setMainNet(url) {
    return this.MAINNET_URL = url;
  }

  reConnect() {
    this.connection = new Connection(this.MAINNET_URL);
  }

  publicKeyFromString(string) {
    return new PublicKey(string);
  }

  keyPairFromSecretKeyArray(secretKeyArray) {
    return Keypair.fromSecretKey(Buffer.from(secretKeyArray));
  }

  async getAssociatedTokenAddress(publicKey, mint) {
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, publicKey
    )
    return associatedTokenAddress;
  }

  getTransactionInstruction(keys, programId, data) {
    const transferIx = new TransactionInstruction({ keys, programId, data });

    return transferIx;
  }

  async transferToken(owner, destination, mint, amount, decimals) {
    const keys = [
      { pubkey: await this.getAssociatedTokenAddress(owner.publicKey, mint), isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: await this.getAssociatedTokenAddress(destination.publicKey, mint), isSigner: false, isWritable: true },
      { pubkey: owner.publicKey, isSigner: true, isWritable: false },
    ]
    
    const programId = TOKEN_PROGRAM_ID;
    const data = this.encodeTokenInstructionData({
      transferChecked: { amount, decimals },
    });
    
    const transferIx = this.getTransactionInstruction(keys, programId, data);
    const transaction = new Transaction();
    
    transaction.add(transferIx);

    transaction.recentBlockhash = (await this.connection.getRecentBlockhash('max')).blockhash;
    transaction.setSigners(owner.publicKey);
    transaction.partialSign(owner);

    const rawTransaction = transaction.serialize();

    return await this.connection.sendRawTransaction(rawTransaction);
  }

  encodeTokenInstructionData(instruction) {
    return LAYOUT.encodeTokenInstructionData(instruction);
  }

  // was in refactoring - transferToken 
  // async transferToken(walletName, destinationName, amount) {
  //   const owner = this.wallets[walletName].keyPair;
  //   const destination = this.destinations[destinationName].publicKey;

  //   const mint = this.mint;

  //   const keys = [
  //     { pubkey: await this.getAssociatedTokenAddress(owner.publicKey, mint), isSigner: false, isWritable: true },
  //     { pubkey: mint, isSigner: false, isWritable: false },
  //     { pubkey: await this.getAssociatedTokenAddress(destination, mint), isSigner: false, isWritable: true },
  //     { pubkey: owner.publicKey, isSigner: true, isWritable: false }
  //   ]
  //   const programId = TOKEN_PROGRAM_ID;
  //   const data = LAYOUT.encodeTokenInstructionData({
  //     transferChecked: { amount, decimals: this.decimals }
  //   });

  //   const transferIx = new TransactionInstruction({ keys, programId, data });
  //   const transaction = new Transaction();
    
  //   transaction.add(transferIx);

    // transaction.recentBlockhash = (await this.connection.getRecentBlockhash('max')).blockhash;
    // transaction.setSigners(owner.publicKey);
    // transaction.partialSign(owner);

    // const rawTransaction = transaction.serialize();

    // return await this.connection.sendRawTransaction(rawTransaction);
  // }
}

module.exports = Solana;