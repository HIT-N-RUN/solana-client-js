const BufferLayout = require('buffer-layout');

class Constant {
  static SERUM_PROJECT_URL = 'https://api.mainnet-beta.solana.com';
  static SGT_MINT_ADDRESS = '4KAFf8ZpNCn1SWLZFo5tbeZsKpVemsobbVZdERWxRvd2';

  static SGT = {
    MINT_ADDRESS: '4KAFf8ZpNCn1SWLZFo5tbeZsKpVemsobbVZdERWxRvd2',
    DECIMALS: 8
  }
}

class LAYOUT {
  static encodeTokenInstructionData(instruction) {
    const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));

    LAYOUT.addVariant(0, 
      BufferLayout.struct([
        BufferLayout.u8('decimals'),
        BufferLayout.blob(32, 'mintAuthority'),
        BufferLayout.u8('freezeAuthorityOption'),
        BufferLayout.blob(32, 'freezeAuthority'),
      ]), 'initializeMint',
    );
    LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
    LAYOUT.addVariant(7, BufferLayout.struct([BufferLayout.nu64('amount')]), 'mintTo');
    LAYOUT.addVariant(8, BufferLayout.struct([BufferLayout.nu64('amount')]), 'burn');
    LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
    LAYOUT.addVariant(12, BufferLayout.struct([BufferLayout.nu64('amount'), BufferLayout.u8('decimals')]), 'transferChecked');

    const instructionMaxSpan = Math.max(...Object.values(LAYOUT.registry).map((r) => r.span));

    let b = Buffer.alloc(instructionMaxSpan);
    let span = LAYOUT.encode(instruction, b);

    return b.slice(0, span);
  }
}



module.exports = {
  Constant, LAYOUT 
}