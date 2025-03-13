import { Buffer } from 'buffer';
import { createHash, createHmac } from 'crypto';

export class SecurityService {
  static generateKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      true,
      ["deriveKey", "deriveBits"]
    );
  }

  static async deriveSharedSecret(privateKey, publicKeyBuffer) {
    const publicKey = await window.crypto.subtle.importKey(
      "raw",
      publicKeyBuffer,
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      true,
      []
    );

    return window.crypto.subtle.deriveBits(
      {
        name: "ECDH",
        public: publicKey
      },
      privateKey,
      256
    );
  }

  static generateMessageSignature(message, key) {
    return createHmac('sha256', key)
      .update(message)
      .digest('hex');
  }

  static verifyMessageSignature(message, signature, key) {
    const computedSignature = this.generateMessageSignature(message, key);
    return computedSignature === signature;
  }
}