# MAIK IDE Implementation Plan - Phase 1: Foundation Enhancement

## Overview

This document outlines the detailed implementation plan for Phase 1 of the MAIK IDE development, focusing on enhancing the foundation of the Bolt DIY system with robust AI integration, WebContainer capabilities, improved memory management, and database-backed project storage.

## 1. OpenAI Integration with GPT-4o Support

### 1.1 OpenAI Service Implementation

```typescript
// core/ai/openai-service.ts
import OpenAI from "openai";
import { injectable, inject } from 'tsyringe';
import { AIServiceConfig } from '../interfaces';
import { LLMAPIError } from '../errors';

@injectable()
export class OpenAIService {
  private openai: OpenAI;
  private defaultModel = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  
  constructor(@inject('AIServiceConfig') private config: AIServiceConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY
    });
  }
  
  async generateCompletion(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    responseFormat?: 'text' | 'json';
  } = {}): Promise<string> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 2048;
      
      const messages = [
        options.systemPrompt 
          ? { role: "system", content: options.systemPrompt as string }
          : { role: "system", content: "You are an expert programmer helping with code." },
        { role: "user", content: prompt }
      ];
      
      const requestOptions: any = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };
      
      // Add response format option for JSON if specified
      if (options.responseFormat === 'json') {
        requestOptions.response_format = { type: "json_object" };
      }
      
      const response = await this.openai.chat.completions.create(requestOptions);
      
      return response.choices[0].message.content || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new LLMAPIError(`OpenAI API call failed: ${errorMessage}`);
    }
  }
  
  async generateWithTools(prompt: string, tools: any[], options: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  } = {}): Promise<any> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? 0.7;
      
      const messages = [
        options.systemPrompt 
          ? { role: "system", content: options.systemPrompt as string }
          : { role: "system", content: "You are an expert programmer helping with code." },
        { role: "user", content: prompt }
      ];
      
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        tools,
        tool_choice: "auto",
      });
      
      return response.choices[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new LLMAPIError(`OpenAI API call with tools failed: ${errorMessage}`);
    }
  }
  
  async analyzeCode(code: string, language: string): Promise<any> {
    const systemPrompt = `You are an expert code analyzer specialized in ${language}. 
    Analyze the provided code and return a JSON object with the following structure:
    {
      "summary": "Brief description of what the code does",
      "complexity": "Low/Medium/High",
      "qualityIssues": [array of code quality issues found],
      "securityIssues": [array of potential security issues],
      "suggestions": [array of improvement suggestions],
      "dependencies": [array of libraries/packages used]
    }`;
    
    const result = await this.generateCompletion(code, {
      systemPrompt,
      responseFormat: 'json',
      temperature: 0.1
    });
    
    return JSON.parse(result);
  }
  
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      
      return response.data[0].url || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new LLMAPIError(`OpenAI Image generation failed: ${errorMessage}`);
    }
  }
}
```

### 1.2 OpenAI Integration Configuration

```typescript
// Update core/di-container.ts
// Add these registrations:

// Register OpenAI service
container.register('AIServiceConfig', {
  useValue: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: 'gpt-4o',
    defaultTemperature: 0.7
  }
});

container.register(OpenAIService, {
  useClass: OpenAIService
});

// Register OpenAI Agent Factory
container.register(OpenAIAgentFactory, {
  useClass: OpenAIAgentFactory
});
```

### 1.3 Agent Update for OpenAI

```typescript
// Update core/agent/agent.ts
// Replace the callLLM method:

private async callLLM(prompt: string): Promise<string> {
  // Get OpenAI service from container
  const openaiService = container.resolve(OpenAIService);
  
  try {
    // Use the service to generate a completion
    return await openaiService.generateCompletion(prompt);
  } catch (error) {
    console.error("LLM Call failed:", error);
    
    // Convert to specific error type
    throw new LLMAPIError(
      `LLM API call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

## 2. WebContainer Service Integration

### 2.1 WebContainer Service Implementation

```typescript
// core/webcontainer/webcontainer-service.ts
import { WebContainer } from '@webcontainer/api';
import { injectable } from 'tsyringe';
import { ProcessOutput } from '@webcontainer/api';

@injectable()
export class WebContainerService {
  private static instance: WebContainerService;
  private container: WebContainer | null = null;
  private isInitialized = false;
  
  private constructor() {}
  
  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }
  
  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      this.container = await WebContainer.boot();
      this.isInitialized = true;
      console.log('WebContainer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      throw error;
    }
  }
  
  public get isBooted(): boolean {
    return this.isInitialized;
  }
  
  public async executeCommand(
    command: string,
    workingDir?: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    // Change directory if specified
    if (workingDir) {
      try {
        await this.container.fs.mkdir(workingDir, { recursive: true });
        await this.container.spawn('cd', [workingDir]);
      } catch (error) {
        console.warn(`Could not change to directory ${workingDir}:`, error);
      }
    }
    
    const parts = command.split(' ');
    const process = await this.container.spawn(parts[0], parts.slice(1));
    
    const output = {
      stdout: '',
      stderr: '',
      exitCode: 0
    };
    
    // Collect stdout
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output.stdout += data;
        }
      })
    );
    
    // Wait for process to finish
    const exitCode = await process.exit;
    output.exitCode = exitCode;
    
    if (exitCode !== 0) {
      console.warn(`Process exited with code ${exitCode}`);
    }
    
    return output;
  }
  
  public async writeFile(path: string, content: string): Promise<void> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    // Create directories if needed
    const dirPath = path.split('/').slice(0, -1).join('/');
    if (dirPath) {
      await this.container.fs.mkdir(dirPath, { recursive: true });
    }
    
    // Write the file
    await this.container.fs.writeFile(path, content);
  }
  
  public async readFile(path: string): Promise<string> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    // Read the file
    const file = await this.container.fs.readFile(path);
    return new TextDecoder().decode(file);
  }
  
  public async listFiles(path: string = '/'): Promise<string[]> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    // List files in directory
    const files = await this.container.fs.readdir(path, { withFileTypes: true });
    return files.map(f => f.name);
  }
  
  public async installDependencies(packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'): Promise<{ success: boolean; output: string }> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    try {
      const command = packageManager === 'npm' ? 'npm install' : 
                      packageManager === 'yarn' ? 'yarn' : 'pnpm install';
      
      const result = await this.executeCommand(command);
      
      return {
        success: result.exitCode === 0,
        output: result.stdout
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  public async startDevServer(command: string = 'npm start'): Promise<{ success: boolean; output: string; url?: string }> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    try {
      // Start the server in the background
      const process = await this.container.spawn('sh', ['-c', command]);
      
      let output = '';
      let url: string | undefined;
      
      // Collect stdout
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
            
            // Try to extract server URL from the output
            const urlMatch = data.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
              url = urlMatch[1];
            }
          }
        })
      );
      
      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        output,
        url
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to start dev server: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
```

### 2.2 WebContainer Integration in Routes

```typescript
// Update server/routes.ts
// Add new routes:

// WebContainer execution route
app.post('/api/webcontainer/execute', async (req, res) => {
  try {
    const schema = z.object({
      command: z.string(),
      workingDirectory: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Initialize WebContainer if not already initialized
    const webContainerService = WebContainerService.getInstance();
    if (!webContainerService.isBooted) {
      await webContainerService.init();
    }
    
    // Execute the command
    const result = await webContainerService.executeCommand(
      validatedData.command,
      validatedData.workingDirectory
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.errors
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Command execution failed',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

// WebContainer file management routes
app.post('/api/webcontainer/writeFile', async (req, res) => {
  try {
    const schema = z.object({
      path: z.string(),
      content: z.string()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Initialize WebContainer if not already initialized
    const webContainerService = WebContainerService.getInstance();
    if (!webContainerService.isBooted) {
      await webContainerService.init();
    }
    
    // Write the file
    await webContainerService.writeFile(validatedData.path, validatedData.content);
    
    res.json({
      success: true,
      data: { path: validatedData.path }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to write file',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

app.get('/api/webcontainer/readFile', async (req, res) => {
  try {
    const path = req.query.path as string;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Path parameter is required'
        }
      });
    }
    
    // Initialize WebContainer if not already initialized
    const webContainerService = WebContainerService.getInstance();
    if (!webContainerService.isBooted) {
      await webContainerService.init();
    }
    
    // Read the file
    const content = await webContainerService.readFile(path);
    
    res.json({
      success: true,
      data: { path, content }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to read file',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

app.get('/api/webcontainer/listFiles', async (req, res) => {
  try {
    const path = (req.query.path as string) || '/';
    
    // Initialize WebContainer if not already initialized
    const webContainerService = WebContainerService.getInstance();
    if (!webContainerService.isBooted) {
      await webContainerService.init();
    }
    
    // List files
    const files = await webContainerService.listFiles(path);
    
    res.json({
      success: true,
      data: { path, files }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to list files',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
});
```

## 3. Enhanced Memory Management

### 3.1 Advanced Memory Manager Implementation

```typescript
// core/memory/advanced-memory-manager.ts
import { injectable } from 'tsyringe';
import { IMemoryManager } from '../interfaces';

interface MemoryEntry {
  input: string;
  response: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ConversationContext {
  messages: MemoryEntry[];
  metadata: Record<string, any>;
}

@injectable()
export class AdvancedMemoryManager implements IMemoryManager {
  private conversations: Map<string, ConversationContext> = new Map();
  private maxConversationLength: number = 20;
  private summarizer: (context: ConversationContext) => Promise<string>;
  
  constructor() {
    // Default summarizer implementation
    this.summarizer = async (context) => {
      const messages = context.messages;
      if (messages.length <= 1) {
        return "No prior conversation.";
      }
      
      return `This conversation has ${messages.length} messages. The main topics discussed are related to code, programming, and development.`;
    };
  }
  
  /**
   * Set a custom summarizer function
   * @param summarizer - Function that takes context and returns a summary
   */
  public setSummarizer(summarizer: (context: ConversationContext) => Promise<string>): void {
    this.summarizer = summarizer;
  }
  
  /**
   * Get conversation context for the current session
   * @param sessionId - Unique session identifier
   * @param currentInput - Current user input
   * @returns Context string for prompt construction
   */
  public async getContext(sessionId: string, currentInput: string): Promise<string> {
    // Get the conversation or create a new one
    const conversation = this.getConversation(sessionId);
    
    // If the conversation is getting too long, summarize it
    if (conversation.messages.length > this.maxConversationLength) {
      await this.summarizeConversation(sessionId);
    }
    
    // Format the context
    return this.formatContextString(conversation, currentInput);
  }
  
  /**
   * Store an interaction in memory
   * @param sessionId - Unique session identifier
   * @param interaction - Interaction to store
   */
  public async storeInteraction(sessionId: string, interaction: { input: string; response: string; metadata?: Record<string, any> }): Promise<void> {
    const conversation = this.getConversation(sessionId);
    
    // Add new message to the conversation
    conversation.messages.push({
      input: interaction.input,
      response: interaction.response,
      timestamp: new Date().toISOString(),
      metadata: interaction.metadata
    });
    
    // Store updated conversation
    this.conversations.set(sessionId, conversation);
  }
  
  /**
   * Get a specific conversation
   * @param sessionId - Session identifier
   * @returns Conversation context
   */
  private getConversation(sessionId: string): ConversationContext {
    // Get existing conversation or create a new one
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      });
    }
    
    return this.conversations.get(sessionId)!;
  }
  
  /**
   * Format a context string for the LLM
   * @param conversation - Conversation context
   * @param currentInput - Current user input
   * @returns Formatted context string
   */
  private formatContextString(conversation: ConversationContext, currentInput: string): string {
    if (conversation.messages.length === 0) {
      return "This is a new conversation. No prior context.";
    }
    
    let contextString = "Here's the conversation history:\n\n";
    
    // Add summary if available
    if (conversation.metadata.summary) {
      contextString += `SUMMARY: ${conversation.metadata.summary}\n\n`;
    }
    
    // Add recent messages
    // Get last N messages to avoid token limits
    const recentMessages = conversation.messages.slice(-5);
    
    for (const message of recentMessages) {
      contextString += `USER: ${message.input}\n`;
      contextString += `ASSISTANT: ${message.response}\n\n`;
    }
    
    // Add current input
    contextString += `Current user question: ${currentInput}\n`;
    
    return contextString;
  }
  
  /**
   * Summarize a conversation to reduce token usage
   * @param sessionId - Session identifier
   */
  private async summarizeConversation(sessionId: string): Promise<void> {
    const conversation = this.getConversation(sessionId);
    
    // Only summarize if we have enough messages
    if (conversation.messages.length < 10) {
      return;
    }
    
    // Generate a summary of the conversation
    const summary = await this.summarizer(conversation);
    
    // Update metadata with summary
    conversation.metadata.summary = summary;
    
    // Keep only the last 5 messages
    conversation.messages = conversation.messages.slice(-5);
    
    // Update the conversation in memory
    this.conversations.set(sessionId, conversation);
  }
  
  /**
   * Clear a conversation from memory
   * @param sessionId - Session identifier
   */
  public clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }
  
  /**
   * Export conversation data for persistence
   * @param sessionId - Session identifier
   * @returns Serializable conversation data
   */
  public exportConversation(sessionId: string): ConversationContext | null {
    return this.conversations.get(sessionId) || null;
  }
  
  /**
   * Import conversation data from persistence
   * @param sessionId - Session identifier
   * @param data - Conversation data
   */
  public importConversation(sessionId: string, data: ConversationContext): void {
    this.conversations.set(sessionId, data);
  }
}
```

### 3.2 Memory Integration with OpenAI

```typescript
// Update core/di-container.ts
// Update container registrations:

container.register<IMemoryManager>('IMemoryManager', {
  useClass: AdvancedMemoryManager
});

// Add this initialization:

// Initialize memory manager with OpenAI summarizer
container.afterResolution<IMemoryManager>('IMemoryManager', (memoryManager, _, __) => {
  const openaiService = container.resolve(OpenAIService);
  
  // Set custom summarizer using OpenAI
  (memoryManager as AdvancedMemoryManager).setSummarizer(async (context) => {
    // Extract the conversation
    const messages = context.messages;
    
    // Format the conversation for summarization
    let conversationText = messages.map(message => 
      `USER: ${message.input}\nASSISTANT: ${message.response}`
    ).join('\n\n');
    
    // Generate a summary
    const summary = await openaiService.generateCompletion(
      `Please summarize the following conversation concisely, capturing the key points and topics discussed:\n\n${conversationText}`,
      {
        systemPrompt: "You are an expert conversation summarizer. Create concise, informative summaries that capture key information while reducing token usage.",
        temperature: 0.3,
        maxTokens: 250
      }
    );
    
    return summary;
  });
  
  return memoryManager;
}, { lifecycle: Lifecycle.Singleton });
```

## 4. Database-Backed Project Storage

### 4.1 PostgreSQL Database Setup

```typescript
// Create a PostgreSQL database
// First, install the required packages:
// @neondatabase/serverless drizzle-orm

// shared/schema.ts - Add the following:

import { pgTable, serial, text, timestamp, boolean, pgEnum, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  path: text("path").notNull(),
  content: text("content"),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Backups table
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  files: json("files"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  messages: json("messages"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, lastModified: true });
export const insertBackupSchema = createInsertSchema(backups).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type File = typeof files.$inferSelect;
export type Backup = typeof backups.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type InsertBackup = z.infer<typeof insertBackupSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
```

### 4.2 Database Connection Setup

```typescript
// server/db.ts
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

// Enable prepared statements
neonConfig.fetchOptions = {
  cache: 'no-store',
};

// Initialize database client
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 4.3 Storage Implementation

```typescript
// server/storage.ts
import { db } from './db';
import { 
  users, 
  projects, 
  files, 
  backups, 
  conversations,
  type User, 
  type Project, 
  type File, 
  type Backup, 
  type Conversation,
  type InsertUser, 
  type InsertProject, 
  type InsertFile, 
  type InsertBackup, 
  type InsertConversation 
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // File methods
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(projectId: number, path: string): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, data: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Backup methods
  getBackup(id: number): Promise<Backup | undefined>;
  getBackupsByProject(projectId: number): Promise<Backup[]>;
  createBackup(backup: InsertBackup): Promise<Backup>;
  deleteBackup(id: number): Promise<boolean>;
  
  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  getConversationsByProject(projectId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }
  
  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }
  
  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Delete all associated files and backups first
    await db.delete(files).where(eq(files.projectId, id));
    await db.delete(backups).where(eq(backups.projectId, id));
    
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0];
  }
  
  async getFileByPath(projectId: number, path: string): Promise<File | undefined> {
    const result = await db
      .select()
      .from(files)
      .where(and(eq(files.projectId, projectId), eq(files.path, path)));
    return result[0];
  }
  
  async getFilesByProject(projectId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.projectId, projectId));
  }
  
  async createFile(file: InsertFile): Promise<File> {
    const result = await db.insert(files).values(file).returning();
    return result[0];
  }
  
  async updateFile(id: number, data: Partial<InsertFile>): Promise<File | undefined> {
    const result = await db
      .update(files)
      .set({ ...data, lastModified: new Date() })
      .where(eq(files.id, id))
      .returning();
    return result[0];
  }
  
  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id)).returning();
    return result.length > 0;
  }
  
  // Backup methods
  async getBackup(id: number): Promise<Backup | undefined> {
    const result = await db.select().from(backups).where(eq(backups.id, id));
    return result[0];
  }
  
  async getBackupsByProject(projectId: number): Promise<Backup[]> {
    return await db.select().from(backups).where(eq(backups.projectId, projectId));
  }
  
  async createBackup(backup: InsertBackup): Promise<Backup> {
    const result = await db.insert(backups).values(backup).returning();
    return result[0];
  }
  
  async deleteBackup(id: number): Promise<boolean> {
    const result = await db.delete(backups).where(eq(backups.id, id)).returning();
    return result.length > 0;
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  }
  
  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }
  
  async getConversationsByProject(projectId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.projectId, projectId));
  }
  
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }
  
  async updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }
  
  async deleteConversation(id: number): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }
}

// Use PostgresStorage in development/production, MemStorage for testing
export const storage = process.env.NODE_ENV === 'test' 
  ? new MemStorage() 
  : new PostgresStorage();
```

### 4.4 Database Migration Setup

```typescript
// database initialization script
// scripts/init-db.ts

import { PostgresStorage } from '../server/storage';
import { sql } from '../server/db';
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  console.log('Initializing database...');
  
  // Create a temporary drizzle instance
  const db = drizzle(sql);
  
  // Create tables
  console.log('Creating tables...');
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) NOT NULL,
      path TEXT NOT NULL,
      content TEXT,
      last_modified TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS backups (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) NOT NULL,
      name TEXT NOT NULL,
      files JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      project_id INTEGER REFERENCES projects(id),
      messages JSONB,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  console.log('Database initialized successfully!');
}

main().catch(e => {
  console.error('Failed to initialize database:', e);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});
```

## 5. Additional Enhancements for Phase 1

### 5.1 Environment Configuration Setup

```typescript
// .env.example file
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgres://username:password@host:port/dbname
```

### 5.2 Updated API Types

```typescript
// Add to shared/api-types.ts:

// Code analysis
export interface ICodeAnalysisRequest {
  code: string;
  language: string;
}

export interface ICodeAnalysisResponse {
  summary: string;
  complexity: 'Low' | 'Medium' | 'High';
  qualityIssues: string[];
  securityIssues: string[];
  suggestions: string[];
  dependencies: string[];
}

// WebContainer types
export interface IWebContainerFileRequest {
  path: string;
  content?: string;
}

export interface IWebContainerFileResponse {
  path: string;
  content?: string;
}

export interface IWebContainerListFilesResponse {
  path: string;
  files: string[];
}

export interface IWebContainerCommandResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Update AI related types
export type AIAgent = 'Coder' | 'Debugger' | 'WCAG Auditor' | 'Prompt Engineer' | 'Database Expert';
export type AIModel = 'GPT-4o' | 'GPT-4' | 'Tabby' | 'Claude-3';
```

## Next Steps

After implementing the above components, the following steps should be taken to complete Phase 1:

1. Install the necessary dependencies:
   - OpenAI
   - @neondatabase/serverless
   - drizzle-orm
   - @webcontainer/api

2. Set up the PostgreSQL database using the provided scripts

3. Update the core dependency injection container to include all new services

4. Implement basic frontend components to interact with the new features

5. Test the integration points:
   - OpenAI API connectivity
   - WebContainer functionality
   - Memory management with conversation history
   - Database-backed project storage

6. Document the implemented features and prepare for Phase 2