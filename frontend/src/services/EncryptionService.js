import CryptoJS from 'crypto-js';

export class EncryptionService {
  static generateKeyPair() {
    const key = CryptoJS.lib.WordArray.random(256/8);
    return key.toString();
  }

  static encryptMessage(message, key) {
    return CryptoJS.AES.encrypt(message, key).toString();
  }

  static decryptMessage(encryptedMessage, key) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}