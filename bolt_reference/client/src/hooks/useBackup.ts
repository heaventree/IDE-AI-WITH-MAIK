import { useState, useCallback } from 'react';
import { BackupService } from '../services/BackupService';
import { BackupMetadata, BackupOptions, FileEntry } from '../types';

export const useBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const metadata = await BackupService.getBackupMetadata();
      setBackups(metadata);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch backups:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBackup = useCallback(async (
    files: FileEntry[],
    options?: Partial<BackupOptions>
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backupId = await BackupService.createBackup(files, options);
      await fetchBackups();
      return backupId;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to create backup:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups]);

  const restoreBackup = useCallback(async (
    backupId: string
  ): Promise<Record<string, FileEntry>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await BackupService.restoreBackup(backupId);
      return files;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to restore backup:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await BackupService.deleteBackup(backupId);
      await fetchBackups();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to delete backup:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups]);

  return {
    isLoading,
    backups,
    error,
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup
  };
};
