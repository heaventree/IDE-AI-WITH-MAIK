// File types and project structure
export interface FileEntry {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  icon?: string;
  extension?: string;
  children?: FileEntry[];
  path: string;
  lastModified?: Date;
}

// Project state types
export interface ProjectState {
  files: Record<string, FileEntry>;
  openFiles: string[];
  activeFile: string | null;
  unsavedChanges: Set<string>;
  containerStatus: 'idle' | 'loading' | 'ready' | 'error';
  backupStatus: {
    lastBackup: Date | null;
    syncStatus: 'synced' | 'syncing' | 'error';
    targets: Array<'local' | 'github' | 'onedrive'>;
  };
}

// AI types
export type AIAgent = 'Coder' | 'Debugger' | 'WCAG Auditor';
export type AIModel = 'GPT-4' | 'Tabby' | 'Claude-3'; 

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: AIAgent;
  model?: AIModel;
}

export interface AIThread {
  id: string;
  messages: AIMessage[];
  agent: AIAgent;
  model: AIModel;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIQueryRequest {
  agent: AIAgent;
  model?: AIModel;
  query: string;
  context: {
    files: Record<string, FileEntry>;
    selectedFile: string | null;
  };
}

// WebContainer types
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Backup types
export interface BackupOptions {
  targets: Array<'local' | 'github' | 'onedrive'>;
  encrypt: boolean;
  interval: number;
}

export interface BackupMetadata {
  timestamp: Date;
  files: string[];
  size: number;
  checksum: string;
  target: 'local' | 'github' | 'onedrive';
}

// Encryption types
export interface EncryptionKeys {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  authTag?: string; // Base64 encoded authentication tag for AES-GCM
}
