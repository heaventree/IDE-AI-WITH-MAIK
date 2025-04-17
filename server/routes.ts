import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocket, WebSocketServer } from 'ws';
import { z } from 'zod';
import { IApiResponse, IAIQueryRequest, ICommandExecutionRequest, ISyncRequest, IBackupRequest, IRestoreBackupRequest, IErrorResponse } from "@shared/api-types";
import { handleBoltQuery } from "./bolt-integration";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications and collaborative editing
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws', // Specify a specific path for the WebSocket connection
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024
    }
  });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    // Send an initial message to confirm connection
    ws.send(JSON.stringify({ 
      type: 'connected', 
      message: 'Connected to MAIK IDE server',
      timestamp: new Date().toISOString() 
    }));
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // User routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(3),
        password: z.string().min(6)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Username already exists'
          }
        } as IApiResponse<null>);
      }
      
      // Create new user
      const user = await storage.createUser({
        username: validatedData.username,
        password: validatedData.password // In a real app, hash the password
      });
      
      // Don't return the password
      const { password, ...userData } = user;
      
      res.status(201).json({
        success: true,
        data: userData
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create user',
          details: { error: (error as Error).message }
        }
      } as IApiResponse<null>);
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const schema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid username or password'
          }
        } as IApiResponse<null>);
      }
      
      // In a real app, set up a session or generate a JWT token
      // For now, just return the user data without password
      const { password, ...userData } = user;
      
      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Login failed',
          details: { error: (error as Error).message }
        }
      } as IApiResponse<null>);
    }
  });
  
  // AI Orchestration routes
  app.post('/api/ai/query', async (req, res) => {
    try {
      const schema = z.object({
        agent: z.enum(['Coder', 'Debugger', 'WCAG Auditor']),
        model: z.enum(['GPT-4', 'Tabby', 'Claude-3']).optional(),
        query: z.string(),
        context: z.object({
          projectId: z.string().optional(),
          files: z.array(z.string()).optional(),
          activeFile: z.string().optional()
        })
      });
      
      const validatedData = schema.parse(req.body) as IAIQueryRequest;
      
      // Option 1: Use the Bolt DIY agent for processing (production)
      let response: string;
      try {
        response = await handleBoltQuery(validatedData);
      } catch (error) {
        console.error('Bolt DIY error:', error);
        // Fallback to simulation if Bolt fails
        response = await simulateAIResponse(validatedData);
      }
      
      res.json({
        success: true,
        data: {
          response: response,
          agent: validatedData.agent,
          model: validatedData.model || 'GPT-4',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json(createErrorResponse('AI query failed', (error as Error).message));
    }
  });
  
  // WebContainer execution route
  app.post('/api/execute', async (req, res) => {
    try {
      const schema = z.object({
        command: z.string(),
        workingDirectory: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body) as ICommandExecutionRequest;
      
      // In a real implementation, execute the command in a WebContainer
      // For now, return a simulated response
      const response = simulateCommandExecution(validatedData);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json(createErrorResponse('Command execution failed', (error as Error).message));
    }
  });
  
  // Cloud sync routes
  app.post('/api/sync', async (req, res) => {
    try {
      const schema = z.object({
        projectId: z.string(),
        targets: z.array(z.enum(['github', 'onedrive']))
      });
      
      const validatedData = schema.parse(req.body) as ISyncRequest;
      
      // In a real implementation, sync with cloud services
      // For now, return a simulated response
      
      res.json({
        success: true,
        data: {
          success: true,
          targets: validatedData.targets.map(target => ({
            name: target,
            status: 'success',
            message: `Synced with ${target}`,
            timestamp: new Date().toISOString()
          }))
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json(createErrorResponse('Sync failed', (error as Error).message));
    }
  });
  
  // Backup routes
  app.post('/api/backup', async (req, res) => {
    try {
      const schema = z.object({
        projectId: z.string(),
        targets: z.array(z.enum(['local', 'github', 'onedrive'])),
        encrypt: z.boolean()
      });
      
      const validatedData = schema.parse(req.body) as IBackupRequest;
      
      // In a real implementation, create a backup
      // For now, return a simulated response
      const backupId = generateId();
      
      res.json({
        success: true,
        data: {
          id: backupId,
          metadata: {
            id: backupId,
            projectId: validatedData.projectId,
            timestamp: new Date().toISOString(),
            files: [],
            size: 0,
            checksum: '',
            target: validatedData.targets[0] || 'local'
          }
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json(createErrorResponse('Backup failed', (error as Error).message));
    }
  });
  
  app.post('/api/backup/restore', async (req, res) => {
    try {
      const schema = z.object({
        backupId: z.string()
      });
      
      const validatedData = schema.parse(req.body) as IRestoreBackupRequest;
      
      // In a real implementation, restore from backup
      // For now, return a simulated response
      
      res.json({
        success: true,
        data: {
          restored: true,
          backupId: validatedData.backupId
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors
          }
        } as IApiResponse<null>);
      }
      
      res.status(500).json(createErrorResponse('Restore failed', (error as Error).message));
    }
  });

  return httpServer;
}

// Helper function to generate a random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to generate a standardized error response
function createErrorResponse(message: string, details?: any): IApiResponse<null> {
  const errorDetails: Record<string, any> = 
    typeof details === 'string' ? { error: details } : details || {};
  
  return {
    success: false,
    error: {
      message,
      details: errorDetails
    }
  };
}

// AI simulation helper
async function simulateAIResponse(request: IAIQueryRequest): Promise<string> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return simulated responses based on the agent and query
  switch (request.agent) {
    case 'Coder':
      if (request.query.toLowerCase().includes('webcontainer')) {
        return `Here's a structure for implementing the WebContainerService class:

\`\`\`typescript
import { WebContainer } from '@webcontainer/api';

export class WebContainerService {
  private static instance: WebContainerService;
  private container: WebContainer | null = null;
  
  private constructor() {}
  
  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }
  
  public static async init(): Promise<void> {
    return WebContainerService.getInstance().initContainer();
  }
  
  private async initContainer(): Promise<void> {
    try {
      this.container = await WebContainer.boot();
      console.log('WebContainer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      throw error;
    }
  }
  
  public async executeCommand(
    cmd: string
  ): Promise<{stdout: string; stderr: string}> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    const parts = cmd.split(' ');
    const process = await this.container.spawn(parts[0], parts.slice(1));
    
    const output = {
      stdout: '',
      stderr: ''
    };
    
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output.stdout += data;
        }
      })
    );
    
    process.exit.then((code) => {
      if (code !== 0) {
        console.warn(\`Process exited with code \${code}\`);
      }
    });
    
    return output;
  }
}
\`\`\`

This implementation:

1. Uses the Singleton pattern to ensure only one instance of the service exists
2. Provides a static init method to boot the WebContainer
3. Includes error handling for initialization failures
4. Implements the executeCommand method that takes a command string and returns stdout/stderr`;
      } else {
        return `I'm here to help you with coding tasks. What specific code would you like me to assist with?

Some things I can help with:
- Writing new functions or classes
- Optimizing existing code
- Implementing specific algorithms
- Explaining code concepts
- Suggesting best practices`;
      }
    
    case 'Debugger':
      return `I can help you debug your code. To provide the most helpful assistance, could you share:

1. The specific error message you're seeing (if any)
2. The code that's causing problems
3. What you expected to happen vs. what actually happened

Once I have this information, I can help identify the issue and suggest solutions.`;
    
    case 'WCAG Auditor':
      return `I can help ensure your web application meets WCAG accessibility standards. Here are some important accessibility considerations:

1. Use semantic HTML elements for proper structure
2. Ensure sufficient color contrast (minimum 4.5:1 for normal text)
3. Provide alternative text for images
4. Make sure all functionality is keyboard accessible
5. Include proper focus states for interactive elements
6. Use ARIA attributes when necessary (but prefer semantic HTML when possible)
7. Ensure form inputs have associated labels

Would you like me to focus on any specific aspect of accessibility for your project?`;
    
    default:
      return `I'm not sure how to assist with that query. Could you provide more details about what you're trying to accomplish?`;
  }
}

// Command execution simulation helper
function simulateCommandExecution(request: ICommandExecutionRequest): {stdout: string, stderr: string, exitCode: number} {
  const { command } = request;
  
  if (command.startsWith('npm install')) {
    return {
      stdout: `> ${command}\n+ installed packages successfully\n`,
      stderr: '',
      exitCode: 0
    };
  } else if (command.startsWith('npm start')) {
    return {
      stdout: `> ${command}\n> Starting dev server...\n> Server running at http://localhost:3000\n`,
      stderr: '',
      exitCode: 0
    };
  } else if (command.startsWith('ls')) {
    return {
      stdout: 'index.html\npackage.json\nnode_modules\nsrc\n',
      stderr: '',
      exitCode: 0
    };
  } else {
    return {
      stdout: `Executed: ${command}`,
      stderr: '',
      exitCode: 0
    };
  }
}
