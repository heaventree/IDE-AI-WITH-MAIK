import { AIQueryRequest } from '../types';
import { PromptManager } from './prompt/PromptManager';
import { PromptContext, PromptInput } from '../types/prompt';
import OpenAI from 'openai';

export class AIOrchestrator {
  // Default AI endpoint and API key
  private static AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  private static API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '';
  
  // Prompt manager for creating optimized prompts
  private static promptManager = new PromptManager();
  
  // OpenAI client initialization
  private static openai = new OpenAI({
    apiKey: AIOrchestrator.API_KEY,
    dangerouslyAllowBrowser: true
  });
  
  // Router for different AI models
  private static getModelEndpoint(model: string): { endpoint: string, headers: Record<string, string> } {
    switch (model) {
      case 'GPT-4':
        return {
          endpoint: AIOrchestrator.AI_ENDPOINT,
          headers: {
            'Authorization': `Bearer ${AIOrchestrator.API_KEY}`,
            'Content-Type': 'application/json'
          }
        };
      case 'Tabby':
        return {
          endpoint: import.meta.env.VITE_TABBY_ENDPOINT || 'http://localhost:8080/v1/completions',
          headers: {
            'Content-Type': 'application/json'
          }
        };
      case 'Claude-3':
        return {
          endpoint: import.meta.env.VITE_CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/messages',
          headers: {
            'anthropic-version': '2023-06-01',
            'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY || '',
            'Content-Type': 'application/json'
          }
        };
      default:
        return {
          endpoint: AIOrchestrator.AI_ENDPOINT,
          headers: {
            'Authorization': `Bearer ${AIOrchestrator.API_KEY}`,
            'Content-Type': 'application/json'
          }
        };
    }
  }
  
  // Convert AIQueryRequest to PromptInput and PromptContext
  private static preparePromptData(request: AIQueryRequest): { input: PromptInput, context: PromptContext } {
    const { agent, model = 'GPT-4', query, context } = request;
    
    // Prepare prompt input
    const input: PromptInput = {
      query,
      agent,
      outputFormat: request.outputFormat,
      language: context.language
    };
    
    // Prepare prompt context
    const promptContext: PromptContext = {
      history: request.history || [],
      project: {
        files: Object.keys(context.files),
        activeFile: context.selectedFile || undefined
      }
    };
    
    // If we have code content, add it to the context
    if (context.selectedFile && context.files[context.selectedFile]) {
      const fileEntry = context.files[context.selectedFile];
      if (fileEntry.content) {
        promptContext.codeSnippets = [{
          language: fileEntry.extension?.replace('.', '') || 'text',
          code: fileEntry.content,
          path: context.selectedFile
        }];
      }
    }
    
    return { input, context: promptContext };
  }
  
  // Get the proper model identifier based on the requested model name
  private static getModelIdentifier(model: string): string {
    switch (model) {
      case 'GPT-4':
        return 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      case 'Claude-3':
        return 'claude-3-opus-20240229';
      default:
        return 'gpt-4o';
    }
  }
  
  public static async routeQuery(request: AIQueryRequest): Promise<string> {
    const { agent, model = 'GPT-4', query, context } = request;
    
    try {
      // Use prompt manager to create an optimized prompt
      const { input, context: promptContext } = AIOrchestrator.preparePromptData(request);
      const promptResult = AIOrchestrator.promptManager.createPrompt(input, promptContext);
      
      // Log info about the prompt
      console.log(`Using template: ${promptResult.templateUsed}`);
      console.log(`Estimated tokens: ${promptResult.estimatedTokens}`);
      
      // If API keys are available, make the actual API call
      if (AIOrchestrator.API_KEY) {
        try {
          // Use the appropriate API based on the model
          if (model === 'GPT-4' || model === 'GPT-3.5') {
            const completion = await AIOrchestrator.openai.chat.completions.create({
              model: AIOrchestrator.getModelIdentifier(model),
              messages: [
                { role: "system", content: "You are a helpful assistant specialized in software development." },
                { role: "user", content: promptResult.prompt }
              ],
              temperature: 0.7,
              max_tokens: 1500,
            });
            
            return completion.choices[0].message.content || 'No response generated.';
          } 
          else {
            // For other models, use the fetch API to call their respective endpoints
            const { endpoint, headers } = AIOrchestrator.getModelEndpoint(model);
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                messages: [
                  { role: 'system', content: 'You are a helpful assistant.' },
                  { role: 'user', content: promptResult.prompt }
                ],
                model: AIOrchestrator.getModelIdentifier(model),
                max_tokens: 1000
              })
            });
            
            if (!response.ok) {
              throw new Error(`AI request failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
          return `API request failed: ${(apiError as Error).message}. Please check your API key and try again.`;
        }
      }
      
      // Fall back to simulated response in development mode
      return await AIOrchestrator.simulateResponse(agent, query, context);
    } catch (error) {
      console.error('AI request failed:', error);
      throw new Error(`Failed to get AI response: ${(error as Error).message}`);
    }
  }
  
  // This is just for development/testing mode
  private static async simulateResponse(agent: string, query: string, context: any): Promise<string> {
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated responses based on the agent and query
    switch (agent) {
      case 'Coder':
        if (query.toLowerCase().includes('webcontainer')) {
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
4. Implements the executeCommand method that takes a command string, splits it into command and arguments, and returns the stdout and stderr output

You can use this as the foundation and extend it with additional methods as needed for file operations, dependency installation, etc.`;
        } else if (query.toLowerCase().includes('prompt') && query.toLowerCase().includes('system')) {
          return `I see you're implementing a prompt management system! Based on your documentation and requirements, here are recommendations for making the most of your PromptManager class:

## Prompt Management Best Practices

1. **Template Selection Logic**
   - Consider adding more heuristics to the template selection based on:
     - Query length (longer queries might benefit from structured templates)
     - Presence of specific keywords ("explain", "generate", "debug")
     - User history patterns

2. **Token Optimization Improvements**
   - Replace the simple character-based estimator with a model-specific tokenizer
   - Consider implementing cached tokenization for frequently used template parts
   - Add progressive detail reduction rather than all-or-nothing context elimination

3. **Context Management**
   - Implement a "context importance scoring" system to retain the most relevant context
   - Consider summarizing conversation history rather than truncating it entirely
   - Store context with metadata to help prioritize important elements

4. **Template Enhancements**
   - Add agent-specific templates with specialized prompting techniques
   - Implement domain-specific templates (web dev, data science, etc.)
   - Create templates with different "temperature" recommendations for exploration vs. precision

Would you like me to help implement any of these improvements to your existing PromptManager?`;
        } else {
          return `I'm here to help you with coding tasks. What specific code would you like me to assist with?

Some things I can help with:
- Writing new functions or classes
- Optimizing existing code
- Implementing specific algorithms
- Explaining code concepts
- Suggesting best practices

Let me know what you're working on, and I can provide code samples and explanations.`;
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
}