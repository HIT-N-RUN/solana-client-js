const { union, u8, struct, blob, nu64 } = require("buffer-layout");

/**
 * class for some calculating algorithms
 */

 class Core {
  /**
   * get unique set of instructions via walletName
   * @param {{walletName: string}[]} instructions instructions having transfer datas. 
   * @returns instructions
   */
  static getSetOfWallets(instructions) {
    const walletNames = instructions.map(instruction => instruction.walletName);

    const setOfWallets = [...new Set(walletNames)]
   
    return setOfWallets;
  }
}

/**
 * class for instruction layout
 */
 class LAYOUT {
  static encodeTokenInstructionData(instruction) {
    const LAYOUT = union(u8('instruction'));

    LAYOUT.addVariant(0, 
      struct([
        u8('decimals'),
        blob(32, 'mintAuthority'),
        u8('freezeAuthorityOption'),
        blob(32, 'freezeAuthority'),
      ]), 'initializeMint',
    );
    LAYOUT.addVariant(1, struct([]), 'initializeAccount');
    LAYOUT.addVariant(7, struct([nu64('amount')]), 'mintTo');
    LAYOUT.addVariant(8, struct([nu64('amount')]), 'burn');
    LAYOUT.addVariant(9, struct([]), 'closeAccount');
    LAYOUT.addVariant(12, struct([nu64('amount'), u8('decimals')]), 'transferChecked');

    const instructionMaxSpan = Math.max(...Object.values(LAYOUT.registry).map((r) => r.span));

    let b = Buffer.alloc(instructionMaxSpan);
    let span = LAYOUT.encode(instruction, b);

    return b.slice(0, span);
  }
}

module.exports = {
  Core, LAYOUT
}