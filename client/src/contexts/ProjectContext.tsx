import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ProjectState, FileEntry, BackupOptions } from '../types';
import { WebContainerService } from '../services/WebContainerService';
import { BackupService } from '../services/BackupService';
import { StorageService } from '../services/StorageService';
import { SyncService } from '../services/SyncService';
import { useToast } from '@/hooks/use-toast';

// Define the default project state
const defaultProjectState: ProjectState = {
  files: {},
  openFiles: [],
  activeFile: null,
  unsavedChanges: new Set<string>(),
  containerStatus: 'idle',
  backupStatus: {
    lastBackup: null,
    syncStatus: 'synced',
    targets: ['local']
  }
};

// Define the shape of our context
export interface ProjectContextProps {
  projectState: ProjectState;
  initializeProject: () => Promise<void | (() => void)>;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  saveFile: (path: string, content: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  setActiveFile: (path: string | null) => void;
  executeCommand: (command: string) => Promise<{stdout: string, stderr: string, exitCode: number}>;
  runProject: () => Promise<any>;
  createBackup: (options?: Partial<BackupOptions>) => Promise<void>;
  restoreBackup: (backupId: string) => Promise<void>;
}

const defaultProjectState: ProjectState = {
  files: {},
  openFiles: [],
  activeFile: null,
  unsavedChanges: new Set<string>(),
  containerStatus: 'idle',
  backupStatus: {
    lastBackup: null,
    syncStatus: 'synced',
    targets: ['local']
  }
};

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectState, setProjectState] = useState<ProjectState>(defaultProjectState);
  // Using the hook since we fixed the provider order
  const { toast } = useToast();

  // Initialize project
  const initializeProject = useCallback(async () => {
    try {
      // Update container status
      setProjectState(prev => ({ ...prev, containerStatus: 'loading' }));
      
      // Initialize WebContainer
      await WebContainerService.init();
      
      // Load project files from local storage
      const loadedFiles = await StorageService.loadFiles();
      
      // Update project state
      setProjectState(prev => ({
        ...prev,
        files: loadedFiles || {},
        containerStatus: 'ready',
      }));
      
      // Setup backup interval (15 minutes)
      const backupInterval = setInterval(() => {
        BackupService.createBackup(Object.values(loadedFiles || {}));
        setProjectState(prev => ({
          ...prev,
          backupStatus: {
            ...prev.backupStatus,
            lastBackup: new Date(),
            syncStatus: 'synced'
          }
        }));
      }, 15 * 60 * 1000);
      
      // Clean up interval on unmount
      return () => clearInterval(backupInterval);
    } catch (error) {
      console.error('Failed to initialize project:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize project. See console for details.",
        variant: "destructive"
      });
      setProjectState(prev => ({ ...prev, containerStatus: 'error' }));
    }
  }, [toast]);

  // File operations
  const openFile = useCallback((path: string) => {
    setProjectState(prev => {
      // Don't reopen if already open
      if (prev.openFiles.includes(path)) {
        return { ...prev, activeFile: path };
      }
      
      return {
        ...prev,
        openFiles: [...prev.openFiles, path],
        activeFile: path
      };
    });
  }, []);

  const closeFile = useCallback((path: string) => {
    setProjectState(prev => {
      const openFiles = prev.openFiles.filter(p => p !== path);
      const activeFile = prev.activeFile === path
        ? openFiles.length > 0 ? openFiles[0] : null
        : prev.activeFile;
        
      // Remove from unsaved changes if present
      const unsavedChanges = new Set(prev.unsavedChanges);
      if (unsavedChanges.has(path)) {
        unsavedChanges.delete(path);
      }
      
      return {
        ...prev,
        openFiles,
        activeFile,
        unsavedChanges
      };
    });
  }, []);

  const saveFile = useCallback(async (path: string, content: string) => {
    try {
      // Save file to storage
      await StorageService.saveFile(path, content);
      
      // Update file in project state
      setProjectState(prev => {
        const updatedFiles = { ...prev.files };
        
        // Update existing file or create new one
        if (updatedFiles[path]) {
          updatedFiles[path] = {
            ...updatedFiles[path],
            content,
            lastModified: new Date()
          };
        } else {
          // Extract filename and extension
          const pathParts = path.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const extensionMatch = fileName.match(/\.([^.]+)$/);
          const extension = extensionMatch ? extensionMatch[1] : undefined;
          
          updatedFiles[path] = {
            name: fileName,
            path,
            type: 'file',
            content,
            extension,
            lastModified: new Date()
          };
        }
        
        // Remove from unsaved changes
        const unsavedChanges = new Set(prev.unsavedChanges);
        if (unsavedChanges.has(path)) {
          unsavedChanges.delete(path);
        }
        
        return {
          ...prev,
          files: updatedFiles,
          unsavedChanges
        };
      });
      
      // Write to WebContainer file system
      if (projectState.containerStatus === 'ready') {
        await WebContainerService.writeFile(path, content);
      }
      
      toast({
        title: "File Saved",
        description: `${path} saved successfully.`
      });
    } catch (error) {
      console.error('Failed to save file:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save ${path}. See console for details.`,
        variant: "destructive"
      });
    }
  }, [projectState.containerStatus, toast]);

  const createFile = useCallback(async (path: string, content = '') => {
    try {
      // Extract filename and extension
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const extensionMatch = fileName.match(/\.([^.]+)$/);
      const extension = extensionMatch ? extensionMatch[1] : undefined;
      
      // Create file in storage
      await StorageService.saveFile(path, content);
      
      // Update project state
      setProjectState(prev => {
        const updatedFiles = { ...prev.files };
        updatedFiles[path] = {
          name: fileName,
          path,
          type: 'file',
          content,
          extension,
          lastModified: new Date()
        };
        
        return {
          ...prev,
          files: updatedFiles,
          openFiles: [...prev.openFiles, path],
          activeFile: path
        };
      });
      
      // Write to WebContainer file system
      if (projectState.containerStatus === 'ready') {
        await WebContainerService.writeFile(path, content);
      }
      
      toast({
        title: "File Created",
        description: `${fileName} created successfully.`
      });
    } catch (error) {
      console.error('Failed to create file:', error);
      toast({
        title: "Create Failed",
        description: `Failed to create ${path}. See console for details.`,
        variant: "destructive"
      });
    }
  }, [projectState.containerStatus, toast]);

  const createFolder = useCallback(async (path: string) => {
    try {
      // Extract folder name
      const pathParts = path.split('/');
      const folderName = pathParts[pathParts.length - 1];
      
      // Update project state
      setProjectState(prev => {
        const updatedFiles = { ...prev.files };
        updatedFiles[path] = {
          name: folderName,
          path,
          type: 'folder',
          children: [],
          lastModified: new Date()
        };
        
        return {
          ...prev,
          files: updatedFiles
        };
      });
      
      // Create folder in WebContainer file system
      if (projectState.containerStatus === 'ready') {
        await WebContainerService.createFolder(path);
      }
      
      toast({
        title: "Folder Created",
        description: `${folderName} created successfully.`
      });
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast({
        title: "Create Failed",
        description: `Failed to create folder ${path}. See console for details.`,
        variant: "destructive"
      });
    }
  }, [projectState.containerStatus, toast]);

  const deleteFile = useCallback(async (path: string) => {
    try {
      // Delete from storage
      await StorageService.deleteFile(path);
      
      // Update project state
      setProjectState(prev => {
        const updatedFiles = { ...prev.files };
        delete updatedFiles[path];
        
        // Close file if open
        const openFiles = prev.openFiles.filter(p => p !== path);
        const activeFile = prev.activeFile === path
          ? openFiles.length > 0 ? openFiles[0] : null
          : prev.activeFile;
          
        // Remove from unsaved changes if present
        const unsavedChanges = new Set(prev.unsavedChanges);
        if (unsavedChanges.has(path)) {
          unsavedChanges.delete(path);
        }
        
        return {
          ...prev,
          files: updatedFiles,
          openFiles,
          activeFile,
          unsavedChanges
        };
      });
      
      // Delete from WebContainer file system
      if (projectState.containerStatus === 'ready') {
        await WebContainerService.deleteFile(path);
      }
      
      toast({
        title: "File Deleted",
        description: `${path} deleted successfully.`
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete ${path}. See console for details.`,
        variant: "destructive"
      });
    }
  }, [projectState.containerStatus, toast]);

  const renameFile = useCallback(async (oldPath: string, newPath: string) => {
    try {
      // Get the file from current state
      const file = projectState.files[oldPath];
      if (!file) {
        throw new Error(`File not found: ${oldPath}`);
      }
      
      // Extract new filename
      const pathParts = newPath.split('/');
      const newFileName = pathParts[pathParts.length - 1];
      
      // Update storage
      await StorageService.renameFile(oldPath, newPath);
      
      // Update project state
      setProjectState(prev => {
        const updatedFiles = { ...prev.files };
        
        // Remove old path
        delete updatedFiles[oldPath];
        
        // Add with new path
        updatedFiles[newPath] = {
          ...file,
          name: newFileName,
          path: newPath,
          lastModified: new Date()
        };
        
        // Update open files and active file if needed
        const openFiles = prev.openFiles.map(p => p === oldPath ? newPath : p);
        const activeFile = prev.activeFile === oldPath ? newPath : prev.activeFile;
        
        // Update unsaved changes if present
        const unsavedChanges = new Set(prev.unsavedChanges);
        if (unsavedChanges.has(oldPath)) {
          unsavedChanges.delete(oldPath);
          unsavedChanges.add(newPath);
        }
        
        return {
          ...prev,
          files: updatedFiles,
          openFiles,
          activeFile,
          unsavedChanges
        };
      });
      
      // Rename in WebContainer file system
      if (projectState.containerStatus === 'ready') {
        await WebContainerService.renameFile(oldPath, newPath);
      }
      
      toast({
        title: "File Renamed",
        description: `${oldPath} renamed to ${newPath} successfully.`
      });
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast({
        title: "Rename Failed",
        description: `Failed to rename ${oldPath}. See console for details.`,
        variant: "destructive"
      });
    }
  }, [projectState.files, projectState.containerStatus, toast]);

  const setActiveFile = useCallback((path: string | null) => {
    if (path === null || projectState.files[path]) {
      setProjectState(prev => ({ ...prev, activeFile: path }));
    }
  }, [projectState.files]);

  // WebContainer operations
  const executeCommand = useCallback(async (command: string) => {
    if (projectState.containerStatus !== 'ready') {
      throw new Error('WebContainer is not ready');
    }
    
    try {
      return await WebContainerService.executeCommand(command);
    } catch (error) {
      console.error('Command execution failed:', error);
      throw error;
    }
  }, [projectState.containerStatus]);

  const runProject = useCallback(async () => {
    if (projectState.containerStatus !== 'ready') {
      throw new Error('WebContainer is not ready');
    }
    
    try {
      // Detect package.json and use npm start
      if (projectState.files['package.json']) {
        return await WebContainerService.executeCommand('npm start');
      } else {
        throw new Error('No package.json found. Unable to determine how to run the project.');
      }
    } catch (error) {
      console.error('Project run failed:', error);
      throw error;
    }
  }, [projectState.containerStatus, projectState.files]);

  // Backup operations
  const createBackup = useCallback(async (options?: Partial<BackupOptions>) => {
    try {
      setProjectState(prev => ({
        ...prev,
        backupStatus: {
          ...prev.backupStatus,
          syncStatus: 'syncing'
        }
      }));
      
      // Create backup
      await BackupService.createBackup(
        Object.values(projectState.files).filter(file => file.type === 'file'),
        options
      );
      
      // Update state
      setProjectState(prev => ({
        ...prev,
        backupStatus: {
          lastBackup: new Date(),
          syncStatus: 'synced',
          targets: options?.targets || prev.backupStatus.targets
        }
      }));
      
      toast({
        title: "Backup Created",
        description: "Project backup completed successfully."
      });
    } catch (error) {
      console.error('Backup failed:', error);
      setProjectState(prev => ({
        ...prev,
        backupStatus: {
          ...prev.backupStatus,
          syncStatus: 'error'
        }
      }));
      
      toast({
        title: "Backup Failed",
        description: "Project backup failed. See console for details.",
        variant: "destructive"
      });
    }
  }, [projectState.files, toast]);

  const restoreBackup = useCallback(async (backupId: string) => {
    try {
      // Restore backup
      const restoredFiles = await BackupService.restoreBackup(backupId);
      
      // Update project state
      setProjectState(prev => ({
        ...prev,
        files: restoredFiles,
        openFiles: [],
        activeFile: null,
        unsavedChanges: new Set()
      }));
      
      toast({
        title: "Backup Restored",
        description: "Project backup restored successfully."
      });
    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. See console for details.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Sync with cloud services (GitHub, OneDrive)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (projectState.backupStatus.targets.includes('github') || 
          projectState.backupStatus.targets.includes('onedrive')) {
        try {
          setProjectState(prev => ({
            ...prev,
            backupStatus: {
              ...prev.backupStatus,
              syncStatus: 'syncing'
            }
          }));
          
          // Sync with cloud services
          await SyncService.syncWithCloud(
            Object.values(projectState.files).filter(file => file.type === 'file'),
            projectState.backupStatus.targets as ('github' | 'onedrive')[]
          );
          
          setProjectState(prev => ({
            ...prev,
            backupStatus: {
              ...prev.backupStatus,
              lastBackup: new Date(),
              syncStatus: 'synced'
            }
          }));
        } catch (error) {
          console.error('Cloud sync failed:', error);
          setProjectState(prev => ({
            ...prev,
            backupStatus: {
              ...prev.backupStatus,
              syncStatus: 'error'
            }
          }));
        }
      }
    }, 60 * 60 * 1000); // Hourly sync
    
    return () => clearInterval(syncInterval);
  }, [projectState.files, projectState.backupStatus.targets]);

  return (
    <ProjectContext.Provider value={{
      projectState,
      initializeProject,
      openFile,
      closeFile,
      saveFile,
      createFile,
      createFolder,
      deleteFile,
      renameFile,
      setActiveFile,
      executeCommand,
      runProject,
      createBackup,
      restoreBackup
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextProps => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
