import { EncryptionKeys, EncryptedData } from '../types';

export class EncryptionService {
  private static encryptionEnabled = false;
  private static encryptionKeys: EncryptionKeys | null = null;
  
  public static async init(): Promise<void> {
    try {
      // Check if the Web Crypto API is available
      if (!crypto.subtle) {
        console.warn('Web Crypto API is not available. Encryption will be disabled.');
        return;
      }
      
      // Generate or load encryption keys
      await EncryptionService.getOrCreateKeys();
      
      EncryptionService.encryptionEnabled = true;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      EncryptionService.encryptionEnabled = false;
    }
  }
  
  public static async isEncryptionEnabled(): Promise<boolean> {
    return EncryptionService.encryptionEnabled;
  }
  
  private static async getOrCreateKeys(): Promise<EncryptionKeys> {
    if (EncryptionService.encryptionKeys) {
      return EncryptionService.encryptionKeys;
    }
    
    try {
      // Check if localStorage is available
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Try to load keys from storage
        const storedKeys = localStorage.getItem('encryption_keys');
        
        if (storedKeys) {
          try {
            const { publicKey, privateKey } = JSON.parse(storedKeys);
            
            // Import keys
            const importedPublicKey = await crypto.subtle.importKey(
              'jwk',
              JSON.parse(publicKey),
              {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
              },
              true,
              ['encrypt']
            );
            
            const importedPrivateKey = await crypto.subtle.importKey(
              'jwk',
              JSON.parse(privateKey),
              {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
              },
              true,
              ['decrypt']
            );
            
            EncryptionService.encryptionKeys = {
              publicKey: importedPublicKey,
              privateKey: importedPrivateKey
            };
            
            return EncryptionService.encryptionKeys;
          } catch (error) {
            console.error('Failed to load encryption keys:', error);
          }
        }
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
    
    // Generate new keys
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Export keys for storage
        const exportedPublicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const exportedPrivateKey = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
        
        // Store keys
        localStorage.setItem('encryption_keys', JSON.stringify({
          publicKey: JSON.stringify(exportedPublicKey),
          privateKey: JSON.stringify(exportedPrivateKey)
        }));
      }
    } catch (error) {
      console.warn('Failed to store encryption keys:', error);
    }
    
    EncryptionService.encryptionKeys = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
    
    return EncryptionService.encryptionKeys;
  }
  
  public static async encryptData(data: string): Promise<EncryptedData> {
    if (!EncryptionService.encryptionEnabled) {
      throw new Error('Encryption is not enabled');
    }
    
    const keys = await EncryptionService.getOrCreateKeys();
    
    // Generate a random key for AES-GCM
    const aesKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data with AES-GCM
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      aesKey,
      dataBuffer
    );
    
    // Export the AES key
    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    
    // Encrypt the AES key with RSA-OAEP
    const encryptedAesKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      keys.publicKey,
      exportedAesKey
    );
    
    // Convert ArrayBuffers to Base64 strings
    const encryptedDataBase64 = EncryptionService.arrayBufferToBase64(encryptedData);
    const encryptedAesKeyBase64 = EncryptionService.arrayBufferToBase64(encryptedAesKey);
    const ivBase64 = EncryptionService.arrayBufferToBase64(iv);
    
    return {
      data: encryptedDataBase64,
      iv: ivBase64,
      authTag: encryptedAesKeyBase64
    };
  }
  
  public static async decryptData(encryptedData: EncryptedData): Promise<string> {
    if (!EncryptionService.encryptionEnabled) {
      throw new Error('Encryption is not enabled');
    }
    
    const keys = await EncryptionService.getOrCreateKeys();
    
    // Convert Base64 strings to ArrayBuffers
    const encryptedDataBuffer = EncryptionService.base64ToArrayBuffer(encryptedData.data);
    const encryptedAesKeyBuffer = EncryptionService.base64ToArrayBuffer(encryptedData.authTag!);
    const ivBuffer = EncryptionService.base64ToArrayBuffer(encryptedData.iv);
    
    // Decrypt the AES key with RSA-OAEP
    const aesKeyBuffer = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      keys.privateKey,
      encryptedAesKeyBuffer
    );
    
    // Import the AES key
    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    );
    
    // Decrypt the data with AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      aesKey,
      encryptedDataBuffer
    );
    
    // Convert ArrayBuffer to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
  
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  public static async generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

// Initialize encryption service
EncryptionService.init().catch(console.error);
