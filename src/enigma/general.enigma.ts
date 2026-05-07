import { EncryptionMethods, type EnigmaSchema } from "@/lib/encryption";

export function GeneralEnigmaSchema(key: string): EnigmaSchema[] {
  return [
    {
      method: EncryptionMethods.AES,
      key: () => key, // Layer 1: AES with original key
    },
    {
      method: EncryptionMethods.AES,
      key: () => key.split("").reverse().join(""), // Layer 2: AES with reversed key
    },
    {
      method: EncryptionMethods.AES,
      key: () => key.slice(0, Math.floor(key.length / 2)), // Layer 3: AES with first half of the key
    },
    {
      method: EncryptionMethods.AES,
      key: () => key.slice(Math.floor(key.length / 2)), // Layer 4: AES with second half of the key
    },
    {
      method: EncryptionMethods.base64, // Layer 5: Base64 Encoding
    },
  ];
}
