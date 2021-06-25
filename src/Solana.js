const { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  TransactionInstruction
} = require('@solana/web3.js');
const BufferLayout = require('buffer-layout');

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
      { pubkey: this.getAssociatedTokenAddress(owner.publicKey, mint), isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: this.getAssociatedTokenAddress(destination.publicKey, mint), isSigner: false, isWritable: true },
      { pubkey: owner.publicKey, isSigner: true, isWritable: false },
      // { pubkey: payer.publicKey, isSigner: false, isWritable: false },
    ]
    
    const programId = TOKEN_PROGRAM_ID;
    const data = this.encodeTokenInstructionData({
      transferChecked: { amount, decimals },
    });

    const transferIx = this.getTransactionInstruction(keys, programId, data);
    const transaction = new Transaction();
    transaction.add(transferIx);
    const signers = [owner];

    return await this.connection.sendTransaction(transaction, signers);
  }

  encodeTokenInstructionData(instruction) {
    const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
    LAYOUT.addVariant(
      0,
      BufferLayout.struct([
        BufferLayout.u8('decimals'),
        BufferLayout.blob(32, 'mintAuthority'),
        BufferLayout.u8('freezeAuthorityOption'),
        BufferLayout.blob(32, 'freezeAuthority'),
      ]),
      'initializeMint',
    );
    LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
    LAYOUT.addVariant(
      7,
      BufferLayout.struct([BufferLayout.nu64('amount')]),
      'mintTo',
    );
    LAYOUT.addVariant(
      8,
      BufferLayout.struct([BufferLayout.nu64('amount')]),
      'burn',
    );
    LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
    LAYOUT.addVariant(
      12,
      BufferLayout.struct([BufferLayout.nu64('amount'), BufferLayout.u8('decimals')]),
      'transferChecked',
    );

    const instructionMaxSpan = Math.max(
      ...Object.values(LAYOUT.registry).map((r) => r.span),
    );

    let b = Buffer.alloc(instructionMaxSpan);
    let span = LAYOUT.encode(instruction, b);
    return b.slice(0, span);
  }
}

module.exports = { Solana }