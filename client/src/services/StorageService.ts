import { FileEntry } from '../types';
import { EncryptionService } from './EncryptionService';

// A simple wrapper around IndexedDB/LocalForage
// In a real implementation, you would use LocalForage
export class StorageService {
  private static DB_NAME = 'bolt-diy-enhanced';
  private static FILES_STORE = 'files';
  private static BACKUPS_STORE = 'backups';
  
  private static async getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(StorageService.DB_NAME, 1);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(StorageService.FILES_STORE)) {
          db.createObjectStore(StorageService.FILES_STORE, { keyPath: 'path' });
        }
        
        if (!db.objectStoreNames.contains(StorageService.BACKUPS_STORE)) {
          db.createObjectStore(StorageService.BACKUPS_STORE, { keyPath: 'id' });
        }
      };
    });
  }
  
  public static async loadFiles(): Promise<Record<string, FileEntry>> {
    try {
      const db = await StorageService.getDb();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(StorageService.FILES_STORE, 'readonly');
        const store = transaction.objectStore(StorageService.FILES_STORE);
        const request = store.getAll();
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          const files: Record<string, FileEntry> = {};
          
          // Convert array to record with path as key
          request.result.forEach((file: FileEntry) => {
            files[file.path] = file;
          });
          
          resolve(files);
        };
      });
    } catch (error) {
      console.error('Failed to load files from storage:', error);
      return {};
    }
  }
  
  public static async saveFile(path: string, content: string): Promise<void> {
    try {
      const db = await StorageService.getDb();
      
      // Extract filename and extension
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const extensionMatch = fileName.match(/\.([^.]+)$/);
      const extension = extensionMatch ? extensionMatch[1] : undefined;
      
      // Create file entry
      const file: FileEntry = {
        name: fileName,
        path,
        type: 'file',
        content,
        extension,
        lastModified: new Date()
      };
      
      // Encrypt content if necessary
      if (await EncryptionService.isEncryptionEnabled()) {
        const encrypted = await EncryptionService.encryptData(content);
        file.content = JSON.stringify(encrypted);
      }
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(StorageService.FILES_STORE, 'readwrite');
        const store = transaction.objectStore(StorageService.FILES_STORE);
        const request = store.put(file);
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to save file to storage:', error);
      throw error;
    }
  }
  
  public static async deleteFile(path: string): Promise<void> {
    try {
      const db = await StorageService.getDb();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(StorageService.FILES_STORE, 'readwrite');
        const store = transaction.objectStore(StorageService.FILES_STORE);
        const request = store.delete(path);
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
      throw error;
    }
  }
  
  public static async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const db = await StorageService.getDb();
      
      return new Promise(async (resolve, reject) => {
        const transaction = db.transaction(StorageService.FILES_STORE, 'readwrite');
        const store = transaction.objectStore(StorageService.FILES_STORE);
        
        // Get the file
        const getRequest = store.get(oldPath);
        
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
        
        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            reject(new Error(`File not found: ${oldPath}`));
            return;
          }
          
          // Extract new filename
          const pathParts = newPath.split('/');
          const newFileName = pathParts[pathParts.length - 1];
          
          // Update file with new path and name
          const file = getRequest.result;
          file.path = newPath;
          file.name = newFileName;
          file.lastModified = new Date();
          
          // Delete old file
          const deleteRequest = store.delete(oldPath);
          
          deleteRequest.onerror = () => {
            reject(deleteRequest.error);
          };
          
          deleteRequest.onsuccess = () => {
            // Add file with new path
            const addRequest = store.add(file);
            
            addRequest.onerror = () => {
              reject(addRequest.error);
            };
            
            addRequest.onsuccess = () => {
              resolve();
            };
          };
        };
      });
    } catch (error) {
      console.error('Failed to rename file in storage:', error);
      throw error;
    }
  }
  
  public static async clearStorage(): Promise<void> {
    try {
      const db = await StorageService.getDb();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(StorageService.FILES_STORE, 'readwrite');
        const store = transaction.objectStore(StorageService.FILES_STORE);
        const request = store.clear();
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
}
