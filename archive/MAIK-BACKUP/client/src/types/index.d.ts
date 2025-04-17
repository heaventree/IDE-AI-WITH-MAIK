// AI Message type for chat components
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: AIAgent;
  model?: AIModel;
}

// AI Agent and Model types
export type AIAgent = 'Coder' | 'Debugger' | 'WCAG Auditor';
export type AIModel = 'GPT-4' | 'Tabby' | 'Claude-3';