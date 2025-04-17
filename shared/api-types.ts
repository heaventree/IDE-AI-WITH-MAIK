/**
 * API Types for MAIK IDE
 * These types are shared between the client and server to ensure consistency
 */

// Standard API response envelope
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IErrorResponse;
}

// Error response structure
export interface IErrorResponse {
  message: string;
  details?: any;
  code?: string;
}

// AI Query request
export interface IAIQueryRequest {
  agent: 'Coder' | 'Debugger' | 'WCAG Auditor';
  model?: 'GPT-4' | 'Tabby' | 'Claude-3';
  query: string;
  context: {
    projectId?: string;
    files?: string[];
    activeFile?: string;
  };
}

// Command execution request
export interface ICommandExecutionRequest {
  command: string;
  workingDirectory?: string;
}

// Sync request
export interface ISyncRequest {
  projectId: string;
  targets: Array<'github' | 'onedrive'>;
}

// Backup request
export interface IBackupRequest {
  projectId: string;
  targets: Array<'local' | 'github' | 'onedrive'>;
  encrypt: boolean;
}

// Restore backup request
export interface IRestoreBackupRequest {
  backupId: string;
}