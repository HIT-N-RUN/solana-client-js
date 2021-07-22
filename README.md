# solana-client-js

Solana library for managing wallet and transfering tokens.

## Install

```bash
  npm install solana-client-js
```

## APIs

### Initialize

```javascript
  const { Solana } = require('solana-client-js');

  const conn = new Solana();

  // or 

  const conn = new Solana(
    'https://api.mainnet-beta.solana.com', // main net url
    '4KAFf8ZpNCn1SWLZFo5tbeZsKpVemsobbVZdERWxRvd2', // token mint address
    8 // token decimals
  );
```

### Store wallets

``` javascript
  // Add wallet(name, secretKeyArray)
  conn.addWallet('myWallet', [106,241,17,...,25,111,29,121,118]);

  // Add destination (name, publicKey)
  conn.addDestination('myReceiver', "8z4Wq1gz1u...kNZcDS77KLq");

  console.log(conn.wallets['myWallet'], conn.destinations['myReceiver']);
```

### Transfer tokens

  U should change token infoes to transfer other tokens. (Defalut SGT)

``` javascript
  /*
    ...
    store sender's wallet, payer's wallet and receiver's publicKey
    ...
  */

  const transfers = [
    {walletName: 'sender', destinationName: 'receiver', amount: 1},
    {walletName: 'sender', destinationName: 'receiver', amount: 2}
  ]

  const res = await conn.transferTokens(transfers, 'payer');

  console.log('signatures:', res);
```

## To do

1. Configurations
2. Get wallet infoes (balances, transaction histories)
3. Divide payer wallets and normal wallets. (like destination pubKey)
4. Make token class

## Contributors

[GGULBAE][link_to_GGULBAE]

[link_to_GGULBAE]: https://github.com/GGULBAE "Go GGULBAE GIT"
