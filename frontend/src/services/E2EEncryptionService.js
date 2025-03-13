import CryptoJS from 'crypto-js';

export class E2EEncryptionService {
  constructor() {
    this.keyPair = null;
    this.sharedSecret = null;
  }

  async generateKeyPair() {
    // Generăm o pereche de chei publică/privată folosind curba eliptică P-256
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      true,
      ["deriveKey", "deriveBits"]
    );
    this.keyPair = keyPair;
    return keyPair;
  }

  async exportPublicKey() {
    // Exportăm cheia publică pentru a o trimite celuilalt utilizator
    const rawKey = await window.crypto.subtle.exportKey("raw", this.keyPair.publicKey);
    return Buffer.from(rawKey).toString('base64');
  }

  async deriveSharedSecret(otherPublicKey) {
    // Creăm secretul comun folosind cheia noastră privată și cheia publică a celuilalt utilizator
    const publicKeyBuffer = Buffer.from(otherPublicKey, 'base64');
    const importedKey = await window.crypto.subtle.importKey(
      "raw",
      publicKeyBuffer,
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      true,
      []
    );

    this.sharedSecret = await window.crypto.subtle.deriveBits(
      {
        name: "ECDH",
        public: importedKey
      },
      this.keyPair.privateKey,
      256
    );

    return this.sharedSecret;
  }

  encryptMessage(message) {
    // Criptăm mesajul folosind secretul comun
    const key = CryptoJS.lib.WordArray.create(this.sharedSecret);
    return CryptoJS.AES.encrypt(message, key.toString()).toString();
  }

  decryptMessage(encryptedMessage) {
    // Decriptăm mesajul folosind secretul comun
    const key = CryptoJS.lib.WordArray.create(this.sharedSecret);
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key.toString());
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}