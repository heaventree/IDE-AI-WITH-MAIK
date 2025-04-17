/**
 * Shared API types between client and server
 */

// Project and file operations
export interface IProjectFile {
  path: string;
  content: string;
  lastModified: string;
}

export interface IProject {
  id: string;
  name: string;
  files: IProjectFile[];
  createdAt: string;
  updatedAt: string;
}

// Backup operations
export interface IBackupRequest {
  projectId: string;
  targets: Array<'local' | 'github' | 'onedrive'>;
  encrypt: boolean;
}

export interface IBackupMetadata {
  id: string;
  projectId: string;
  timestamp: string;
  files: string[];
  size: number;
  checksum: string;
  target: 'local' | 'github' | 'onedrive';
}

export interface IBackupResponse {
  id: string;
  metadata: IBackupMetadata;
}

export interface IRestoreBackupRequest {
  backupId: string;
}

// Cloud sync operations
export interface ISyncRequest {
  projectId: string;
  targets: Array<'github' | 'onedrive'>;
}

export interface ISyncResponse {
  success: boolean;
  targets: Array<{
    name: 'github' | 'onedrive';
    status: 'success' | 'error';
    message?: string;
    timestamp: string;
  }>;
}

// Cloud service configuration
export interface ICloudServiceConfig {
  service: 'github' | 'onedrive';
  token: string;
  repository?: string; // For GitHub
  folder?: string; // For OneDrive
}

// AI related types
export type AIAgent = 'Coder' | 'Debugger' | 'WCAG Auditor';
export type AIModel = 'GPT-4' | 'Tabby' | 'Claude-3';

export interface IAIQueryRequest {
  agent: AIAgent;
  model?: AIModel;
  query: string;
  context: {
    projectId?: string;
    files?: string[];
    activeFile?: string;
  };
}

export interface IAIQueryResponse {
  response: string;
  agent: AIAgent;
  model: AIModel;
  timestamp: string;
}

// WebContainer execution
export interface ICommandExecutionRequest {
  command: string;
  workingDirectory?: string;
}

export interface ICommandExecutionResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Error responses
export interface IErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// API Response wrapper
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IErrorResponse;
}
