import CryptoJS from 'crypto-js';

export function encryptAES(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export function decryptAES(ciphertext: string, password: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return decrypted;
  } catch (e) {
    return null;
  }
}
