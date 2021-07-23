class ErrorMessage {
  static NO_WALLET_NAME = "NO WALELT NAME"
  static NO_TOKEN_SYMBOLE_NAME = "no symbol name in spl-token-registry library";
}

class Constant {
  static URL = {
    MAINNET_BETA: 'https://api.mainnet-beta.solana.com'
  }
}

module.exports = {
  Constant, ErrorMessage
}