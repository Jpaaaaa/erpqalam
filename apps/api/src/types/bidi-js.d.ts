declare module 'bidi-js' {
  interface EmbeddingLevels {
    levels: Uint8Array;
  }

  interface BidiInstance {
    getEmbeddingLevels(
      text: string,
      options?: { direction?: 'ltr' | 'rtl' },
    ): EmbeddingLevels;
    getReorderedString(text: string, embeddingLevels: EmbeddingLevels): string;
  }

  function bidiFactory(): BidiInstance;

  export = bidiFactory;
}
