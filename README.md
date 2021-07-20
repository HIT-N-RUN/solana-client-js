# solana-client-js

Solana library for managing wallet and transfering tokens.

## Getting Started

```bash
  npm install solana-client-js
```

## APIs

### Store wallets

``` javascript
  const { Solana } = require('solana-client-js');

  // Secret key of wallet.
  const MY_WALLET_SECRET_KEY = [106,241,17,...,25,111,29,121,118];

  // Public key of receiver.
  const MY_RECEIVER_PUBLIC_KEY = "8z4Wq1gz1u...kNZcDS77KLq";

  // Initialize object.
  const conn = new Solana();

  // Add wallet
  conn.addWallet('myWallet', MY_WALLET_SECRET_KEY);

  // Add destination (only public key)
  conn.addDestination('myReceiver', MY_RECEIVER_PUBLIC_KEY);

  console.log(conn.wallets['myWallet'], conn.destinations['myReceiver']);
```

### Transfer tokens

``` javascript
  const { Solana } = require('solana-client-js');

  const conn = new Solana();

  /*
    ...
    store sender's wallet, payer's wallet and receiver's publicKey
    ...
  */

  const transfers = [
    { 
      walletName: 'sender', destinationName: 'receiver', amount: 1
    },
    { 
      walletName: 'sender', destinationName: 'receiver', amount: 2
    }
  ]

  const res = await conn.transferTokens(transfers, 'payer');

  console.log('signatures:', res);
```

## To do

1. Configurations
2. Get Infoes
3. Get Transaction Histories
4. Divide payer wallets and normal wallets. (like destination pubKey)

## Contributors

[GGULBAE][link_to_GGULBAE]

[link_to_GGULBAE]: https://github.com/GGULBAE "Go GGULBAE GIT"
