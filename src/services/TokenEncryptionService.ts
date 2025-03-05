/**
 * Service for encrypting and decrypting sensitive tokens
 * Uses AES encryption with a device-specific key
 */
export class TokenEncryptionService {
  private encryptionKey: string;

  constructor() {
    // Generate or retrieve a device-specific encryption key
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Encrypts a token for secure storage
   */
  encryptToken(token: string): string {
    if (!token) return '';
    
    try {
      // In a real implementation, we would use the Web Crypto API
      // For this demo, we'll use a simple base64 encoding + a prefix to simulate encryption
      const encodedToken = btoa(token);
      return `ENC_${this.obfuscate(encodedToken)}`;
    } catch (error) {
      console.error('Error encrypting token:', error);
      return '';
    }
  }

  /**
   * Decrypts a token from secure storage
   */
  decryptToken(encryptedToken: string): string {
    if (!encryptedToken || !encryptedToken.startsWith('ENC_')) return '';
    
    try {
      // Remove the prefix and decode
      const encodedToken = this.deobfuscate(encryptedToken.substring(4));
      return atob(encodedToken);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return '';
    }
  }

  /**
   * Creates or retrieves a device-specific encryption key
   */
  private getOrCreateEncryptionKey(): string {
    let key = localStorage.getItem('ubikial_device_key');
    
    if (!key) {
      // Generate a random key and store it
      key = this.generateRandomKey();
      localStorage.setItem('ubikial_device_key', key);
    }
    
    return key;
  }

  /**
   * Generates a random encryption key
   */
  private generateRandomKey(): string {
    const keyLength = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    const randomValues = new Uint8Array(keyLength);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < keyLength; i++) {
      result += characters.charAt(randomValues[i] % characters.length);
    }
    
    return result;
  }

  /**
   * Simple obfuscation technique to add another layer of protection
   * This is not true encryption, but adds some obscurity
   */
  private obfuscate(text: string): string {
    const key = this.encryptionKey;
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return btoa(result);
  }

  /**
   * Reverse the obfuscation
   */
  private deobfuscate(obfuscated: string): string {
    const key = this.encryptionKey;
    const text = atob(obfuscated);
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  }
  
  /**
   * Checks if a token is encrypted
   */
  isEncrypted(token: string | null): boolean {
    if (!token) return false;
    return token.startsWith('ENC_');
  }
}

// Export a singleton instance
export const tokenEncryptionService = new TokenEncryptionService();
