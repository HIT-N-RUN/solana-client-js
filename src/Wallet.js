const { Keypair, PublicKey } = require('@solana/web3.js');

class WalletPrototype {
  name = "";
  publicKey = "";
  associatedAddress = "";

  /**
   * 
   * @param {PublicKey} address address to set as token associated address 
   */
   setAssociatedAddress(address) {
    this.associatedAddress = address;
  }
}

/**
 * class for wallet
 */
 class Wallet extends WalletPrototype {
  /**
   * constructor
   * @param {string} name wallet Name 
   * @param {string} secretKey secretKey for restore wallet datas
   */
  constructor(name, secretKey) {
    super();
    this.name = name;

    this.keyPair = Keypair.fromSecretKey(Buffer.from(secretKey));

    this.publicKey = this.keyPair.publicKey;
    this.secretKey = this.keyPair.secretKey;
  }
}

/**
 * class for destination (public key)
 */
 class Destination extends WalletPrototype {
  /**
   * constructor
   * @param {string} name wallet Name 
   * @param {string} publicKey publicKey for store wallet data
   */
  constructor(name, publicKey) {
    super();
    
    this.name = name;
    this.publicKey = new PublicKey(publicKey);
  }
}

module.exports = {
  Wallet, Destination
}