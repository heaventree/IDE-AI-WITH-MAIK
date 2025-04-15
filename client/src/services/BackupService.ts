import { FileEntry, BackupOptions, BackupMetadata } from '../types';
import { StorageService } from './StorageService';
import { EncryptionService } from './EncryptionService';
import { nanoid } from 'nanoid';

export class BackupService {
  private static DB_NAME = 'bolt-diy-enhanced-backups';
  private static BACKUPS_STORE = 'backups';
  private static METADATA_STORE = 'metadata';
  
  private static async getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BackupService.DB_NAME, 1);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(BackupService.BACKUPS_STORE)) {
          db.createObjectStore(BackupService.BACKUPS_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(BackupService.METADATA_STORE)) {
          db.createObjectStore(BackupService.METADATA_STORE, { keyPath: 'id' });
        }
      };
    });
  }
  
  public static async createBackup(
    files: FileEntry[],
    options?: Partial<BackupOptions>
  ): Promise<string> {
    try {
      const db = await BackupService.getDb();
      
      // Create backup ID
      const backupId = nanoid();
      
      // Serialize files
      const fileData = JSON.stringify(files);
      
      // Create backup
      let backupData = fileData;
      
      // Encrypt if requested
      if (options?.encrypt !== false) {
        const encrypted = await EncryptionService.encryptData(fileData);
        backupData = JSON.stringify(encrypted);
      }
      
      // Calculate checksum (simple implementation)
      const checksum = await BackupService.calculateChecksum(backupData);
      
      // Create metadata
      const metadata: BackupMetadata = {
        timestamp: new Date(),
        files: files.map(f => f.path),
        size: backupData.length,
        checksum,
        target: 'local'
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [BackupService.BACKUPS_STORE, BackupService.METADATA_STORE],
          'readwrite'
        );
        
        const backupsStore = transaction.objectStore(BackupService.BACKUPS_STORE);
        const metadataStore = transaction.objectStore(BackupService.METADATA_STORE);
        
        // Store backup
        const backupRequest = backupsStore.put({
          id: backupId,
          data: backupData
        });
        
        backupRequest.onerror = () => {
          reject(backupRequest.error);
        };
        
        // Store metadata
        const metadataRequest = metadataStore.put({
          id: backupId,
          ...metadata
        });
        
        metadataRequest.onerror = () => {
          reject(metadataRequest.error);
        };
        
        transaction.oncomplete = () => {
          resolve(backupId);
        };
        
        transaction.onerror = () => {
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }
  
  public static async getBackupMetadata(): Promise<BackupMetadata[]> {
    try {
      const db = await BackupService.getDb();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(BackupService.METADATA_STORE, 'readonly');
        const store = transaction.objectStore(BackupService.METADATA_STORE);
        const request = store.getAll();
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
      return [];
    }
  }
  
  public static async restoreBackup(backupId: string): Promise<Record<string, FileEntry>> {
    try {
      const db = await BackupService.getDb();
      
      return new Promise(async (resolve, reject) => {
        const transaction = db.transaction(
          [BackupService.BACKUPS_STORE, BackupService.METADATA_STORE],
          'readonly'
        );
        
        const backupsStore = transaction.objectStore(BackupService.BACKUPS_STORE);
        const metadataStore = transaction.objectStore(BackupService.METADATA_STORE);
        
        // Get backup metadata
        const metadataRequest = metadataStore.get(backupId);
        
        metadataRequest.onerror = () => {
          reject(metadataRequest.error);
        };
        
        metadataRequest.onsuccess = () => {
          if (!metadataRequest.result) {
            reject(new Error(`Backup metadata not found: ${backupId}`));
            return;
          }
          
          const metadata = metadataRequest.result;
          
          // Get backup data
          const backupRequest = backupsStore.get(backupId);
          
          backupRequest.onerror = () => {
            reject(backupRequest.error);
          };
          
          backupRequest.onsuccess = async () => {
            if (!backupRequest.result) {
              reject(new Error(`Backup not found: ${backupId}`));
              return;
            }
            
            const { data } = backupRequest.result;
            
            // Calculate checksum to validate
            const checksum = await BackupService.calculateChecksum(data);
            
            if (checksum !== metadata.checksum) {
              reject(new Error('Backup checksum validation failed'));
              return;
            }
            
            try {
              // Decrypt if necessary
              let fileData = data;
              if (data.startsWith('{') && data.includes('"data":')) {
                // This is encrypted data
                const encryptedData = JSON.parse(data);
                fileData = await EncryptionService.decryptData(encryptedData);
              }
              
              // Parse files
              const files = JSON.parse(fileData) as FileEntry[];
              
              // Convert to record
              const filesRecord: Record<string, FileEntry> = {};
              files.forEach(file => {
                filesRecord[file.path] = file;
              });
              
              // Clear current storage
              await StorageService.clearStorage();
              
              // Save all files to storage
              for (const file of files) {
                if (file.type === 'file' && file.content) {
                  await StorageService.saveFile(file.path, file.content);
                }
              }
              
              resolve(filesRecord);
            } catch (error) {
              reject(error);
            }
          };
        };
      });
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
  
  public static async deleteBackup(backupId: string): Promise<void> {
    try {
      const db = await BackupService.getDb();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [BackupService.BACKUPS_STORE, BackupService.METADATA_STORE],
          'readwrite'
        );
        
        const backupsStore = transaction.objectStore(BackupService.BACKUPS_STORE);
        const metadataStore = transaction.objectStore(BackupService.METADATA_STORE);
        
        // Delete backup
        const backupRequest = backupsStore.delete(backupId);
        
        backupRequest.onerror = () => {
          reject(backupRequest.error);
        };
        
        // Delete metadata
        const metadataRequest = metadataStore.delete(backupId);
        
        metadataRequest.onerror = () => {
          reject(metadataRequest.error);
        };
        
        transaction.oncomplete = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }
  
  // Simple checksum calculation (for demo purposes)
  private static async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  public static async loadFromLocalStorage(): Promise<Record<string, FileEntry> | null> {
    return StorageService.loadFiles();
  }
}
