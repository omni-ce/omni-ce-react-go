import CryptoJS from "crypto-js";

export enum EncryptionMethods {
  AES = "AES",
  TripleDES = "TripleDES",
  DES = "DES",
  Rabbit = "Rabbit",
  RC4 = "RC4",
  base64 = "base64",
}

export interface EnigmaSchema {
  method: EncryptionMethods;
  key?: () => string;
}

export type Method = Exclude<keyof typeof EncryptionMethods, "base64">;

// Helper functions for common tasks
function hashKey(key: string): string {
  return CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
}

// Encryption and Decryption methods
function encryptMethod(method: Method, key: string, plaintext: string): string {
  const keyWA = CryptoJS.enc.Hex.parse(key);

  if (method === EncryptionMethods.RC4) {
    return CryptoJS.RC4.encrypt(plaintext, keyWA).toString();
  }

  // Block ciphers (AES, DES, TripleDES)
  const ivWA = CryptoJS.lib.WordArray.random(
    method === EncryptionMethods.AES ? 16 : 8,
  );

  const encrypted = CryptoJS[method].encrypt(plaintext, keyWA, {
    iv: ivWA,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Prepend IV to ciphertext (Go standard)
  const combined = ivWA.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combined);
}

function decryptMethod(
  method: Method,
  key: string,
  cipher_text: string,
): string {
  const keyWA = CryptoJS.enc.Hex.parse(key);

  if (method === EncryptionMethods.RC4) {
    return CryptoJS.RC4.decrypt(cipher_text, keyWA).toString(CryptoJS.enc.Utf8);
  }

  // Block ciphers (AES, DES, TripleDES)
  const combinedWA = CryptoJS.enc.Base64.parse(cipher_text);
  const blockSize = method === EncryptionMethods.AES ? 16 : 8;

  // Extract IV from the start
  const ivWA = CryptoJS.lib.WordArray.create(
    combinedWA.words.slice(0, blockSize / 4),
    blockSize,
  );
  const ciphertextWA = CryptoJS.lib.WordArray.create(
    combinedWA.words.slice(blockSize / 4),
    combinedWA.sigBytes - blockSize,
  );

  return CryptoJS[method].decrypt(
    // @ts-ignore
    { ciphertext: ciphertextWA },
    keyWA,
    {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString(CryptoJS.enc.Utf8);
}

function applyMethod(
  text: string,
  layer: EnigmaSchema,
  isEncrypt: boolean,
): string {
  if (layer.method === EncryptionMethods.base64) {
    return isEncrypt
      ? CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
      : CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8);
  } else if (layer.key) {
    const key = layer.key();
    return isEncrypt
      ? encryptMethod(layer.method, hashKey(key), text)
      : decryptMethod(layer.method, hashKey(key), text);
  }
  throw new Error(`Key function missing for method: ${layer.method}`);
}

export function encode(enigma_schema: EnigmaSchema[], text: string): string {
  return enigma_schema.reduce(
    (cipher_text, layer) => applyMethod(cipher_text, layer, true),
    text,
  );
}

export function decode(
  enigma_schema: EnigmaSchema[],
  encrypted: string,
): string {
  return enigma_schema.reduceRight(
    (plaintext, layer) => applyMethod(plaintext, layer, false),
    encrypted,
  );
}
