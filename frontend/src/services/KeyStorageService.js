import CryptoJS from 'crypto-js';

export class KeyStorageService {
  static storeSessionKey(userId, key) {
    const encryptedKey = CryptoJS.AES.encrypt(
      key,
      process.env.REACT_APP_LOCAL_STORAGE_KEY
    ).toString();
    
    sessionStorage.setItem(`chat_key_${userId}`, encryptedKey);
  }

  static getSessionKey(userId) {
    const encryptedKey = sessionStorage.getItem(`chat_key_${userId}`);
    if (!encryptedKey) return null;

    const decryptedKey = CryptoJS.AES.decrypt(
      encryptedKey,
      process.env.REACT_APP_LOCAL_STORAGE_KEY
    );
    
    return decryptedKey.toString(CryptoJS.enc.Utf8);
  }

  static removeSessionKey(userId) {
    sessionStorage.removeItem(`chat_key_${userId}`);
  }

  static clearAllKeys() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('chat_key_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}