import CryptoJS from 'crypto-js';

export class SecureFileService {
  static async encryptFile(file, encryptionKey) {
    const buffer = await file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const encrypted = CryptoJS.AES.encrypt(wordArray, encryptionKey).toString();

    return {
      encryptedData: encrypted,
      metadata: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }

  static async decryptFile(encryptedData, metadata, encryptionKey) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const typedArray = this.convertWordArrayToUint8Array(decrypted);
    
    return new File([typedArray], metadata.name, {
      type: metadata.type
    });
  }

  static convertWordArrayToUint8Array(wordArray) {
    const arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
    const length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
    const uInt8Array = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      uInt8Array[i] = (arrayOfWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    
    return uInt8Array;
  }

  static validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
    
    return true;
  }
}