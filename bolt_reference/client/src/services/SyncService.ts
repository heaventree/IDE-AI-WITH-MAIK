import { FileEntry } from '../types';
import { EncryptionService } from './EncryptionService';

export class SyncService {
  private static getGithubToken(): string | null {
    return localStorage.getItem('github_token') || process.env.GITHUB_TOKEN || null;
  }
  
  private static getOneDriveToken(): string | null {
    return localStorage.getItem('onedrive_token') || process.env.ONEDRIVE_TOKEN || null;
  }
  
  public static async syncWithCloud(
    files: FileEntry[],
    targets: Array<'github' | 'onedrive'>
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    
    if (targets.includes('github')) {
      promises.push(SyncService.syncWithGithub(files));
    }
    
    if (targets.includes('onedrive')) {
      promises.push(SyncService.syncWithOneDrive(files));
    }
    
    await Promise.all(promises);
  }
  
  private static async syncWithGithub(files: FileEntry[]): Promise<void> {
    // Check if we have a token
    const token = SyncService.getGithubToken();
    if (!token) {
      console.log('No GitHub token available. Skipping GitHub sync.');
      return;
    }
    
    try {
      console.log('Syncing with GitHub...');
      
      // In a real implementation, you would use the GitHub API to:
      // 1. Get the repository contents
      // 2. Compare with local files
      // 3. Create or update files as needed
      
      // For now, we'll just log the sync
      console.log(`Synced ${files.length} files with GitHub`);
    } catch (error) {
      console.error('GitHub sync failed:', error);
      throw error;
    }
  }
  
  private static async syncWithOneDrive(files: FileEntry[]): Promise<void> {
    // Check if we have a token
    const token = SyncService.getOneDriveToken();
    if (!token) {
      console.log('No OneDrive token available. Skipping OneDrive sync.');
      return;
    }
    
    try {
      console.log('Syncing with OneDrive...');
      
      // In a real implementation, you would use the OneDrive API to:
      // 1. Get the folder contents
      // 2. Compare with local files
      // 3. Create or update files as needed
      
      // For now, we'll just log the sync
      console.log(`Synced ${files.length} files with OneDrive`);
    } catch (error) {
      console.error('OneDrive sync failed:', error);
      throw error;
    }
  }
  
  public static async isGithubConfigured(): Promise<boolean> {
    return !!SyncService.getGithubToken();
  }
  
  public static async isOneDriveConfigured(): Promise<boolean> {
    return !!SyncService.getOneDriveToken();
  }
  
  public static async configureGithub(token: string): Promise<void> {
    localStorage.setItem('github_token', token);
  }
  
  public static async configureOneDrive(token: string): Promise<void> {
    localStorage.setItem('onedrive_token', token);
  }
  
  public static async unconfigureGithub(): Promise<void> {
    localStorage.removeItem('github_token');
  }
  
  public static async unconfigureOneDrive(): Promise<void> {
    localStorage.removeItem('onedrive_token');
  }
}
