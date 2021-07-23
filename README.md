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

  const SolanaClient = new Solana();

  // or 

  const SolanaClient = new Solana(
    'https://api.mainnet-beta.solana.com', // main net url
  );

  await solanaClient.setToken('SGT');
```

### Store wallets

``` javascript
  // Add wallet(name, secretKeyArray)
  await solanaClient.addWallet('myWallet', [106,241,17,...,25,111,29,121,118]);

  // Add destination (name, publicKey)
  await solanaClient.addDestination('myReceiver', "8z4Wq1gz1u...kNZcDS77KLq");
```

### Getting balance of wallets

```javascript
  // Getting Token balance
  const balance = await solanaClient.getWalletBalance('myWallet');

    // Getting Solana balance
  const balance = await solanaClient.getWalletBalance('myWallet', false);
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

  const res = await solanaClient.transferTokens(transfers, 'payer');

  console.log(`signatures: ${res}}\ncheck: https://explorer.solana.com/tx/${res}`);
```

## Contributors

[GGULBAE][link_to_GGULBAE]

[link_to_GGULBAE]: https://github.com/GGULBAE "Go GGULBAE GIT"
