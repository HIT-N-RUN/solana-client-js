# solana-client-js

Solana library for managing wallet and transfering tokens.

## Getting Started

```bash
  npm install solana-client-js
```

## APIs

### Wallet manage

``` javascript
  const { Solana } = require('solana-client-js');

  // Secret key of wallet.
  const MY_WALLET_SECRET_KEY = [106,241,17,...,25,111,29,121,118];

  // Public key of receiver.
  const MY_RECEIVER_PUBLIC_KEY = "8z4Wq1gz1u9cgKLuk7qsCxv6QNFu5294kNZcDS77KLq";

  // Initialize object.
  const conn = new Solana();

  // Add wallet
  conn.addWallet('myWallet', MY_WALLET_SECRET_KEY);

  // Add destination (only public key)
  conn.addDestination('myReceiver', MY_RECEIVER_PUBLIC_KEY);

  console.log(conn.wallets['myWallet'], conn.destinations['myReceiver']);
```

### Get infoes (... preparing)

### Get transaction histories (... preparing)

### Transfer tokens (... preparing)

``` javascript

```

## Configurations (... preparing)

## Thanks To (... preparing)

[How to test npm package in local](<https://flaviocopes.com/npm-local-package/>)
