/**
 * Prompt Templates for different use cases
 */

import { PromptTemplate, PromptInput, PromptContext } from '../../types/prompt';

/**
 * Standard chat template for general conversations
 */
export const standardChatTemplate: PromptTemplate = {
  id: 'standard',
  name: 'Standard Chat',
  description: 'A general-purpose template for conversational interactions',
  tags: ['general', 'conversation'],
  construct: (input: PromptInput, context: PromptContext): string => {
    // System message
    const systemMessage = input.systemMessage || 'You are a helpful AI assistant.';
    
    // Format history
    const formattedHistory = context.history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    // Current query
    const currentQuery = `User: ${input.query}\nAssistant:`;
    
    // Construct prompt
    return `${systemMessage}\n\n${formattedHistory}\n\n${currentQuery}`;
  }
};

/**
 * Structured template with clear sections
 */
export const structuredTemplate: PromptTemplate = {
  id: 'structured',
  name: 'Structured Template',
  description: 'A template with clear sections for different types of context',
  tags: ['detailed', 'complex'],
  construct: (input: PromptInput, context: PromptContext): string => {
    // System message
    const systemMessage = input.systemMessage || 'You are a helpful AI assistant.';
    
    // Project context if available
    let projectContext = '';
    if (context.project) {
      const filesList = context.project.files.join(', ');
      const activeFile = context.project.activeFile 
        ? `\nCurrent file: ${context.project.activeFile}` 
        : '';
      
      projectContext = `\n\n## PROJECT CONTEXT\nFiles in project: ${filesList}${activeFile}`;
    }
    
    // Code snippets if available
    let codeContext = '';
    if (context.codeSnippets && context.codeSnippets.length > 0) {
      codeContext = '\n\n## RELEVANT CODE\n' + context.codeSnippets.map(snippet => {
        return `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`${snippet.path ? `\nFile: ${snippet.path}` : ''}`;
      }).join('\n\n');
    }
    
    // Conversation history
    const conversationHistory = context.history.length > 0
      ? '\n\n## CONVERSATION HISTORY\n' + context.history
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      : '';
    
    // Current query
    const currentQuery = `\n\n## CURRENT QUERY\n${input.query}\n\n## YOUR RESPONSE`;
    
    // Format for output if specified
    const outputInstructions = input.outputFormat
      ? `\n\nPlease format your response as ${input.outputFormat}.`
      : '';
    
    // Construct prompt
    return `## SYSTEM INSTRUCTIONS\n${systemMessage}${outputInstructions}${projectContext}${codeContext}${conversationHistory}${currentQuery}`;
  }
};

/**
 * Compact template optimized for token efficiency
 */
export const compactTemplate: PromptTemplate = {
  id: 'compact',
  name: 'Compact Template',
  description: 'A minimal template optimized for token efficiency',
  tags: ['efficient', 'minimal'],
  construct: (input: PromptInput, context: PromptContext): string => {
    // Simplified system message
    const systemMessage = input.systemMessage || 'You are a helpful assistant.';
    
    // Only include the last 2 messages for history
    const recentHistory = context.history.slice(-2);
    const formattedHistory = recentHistory.length > 0
      ? recentHistory.map(msg => `${msg.role[0].toUpperCase()}:${msg.content}`).join('\n')
      : '';
    
    // Current query (abbreviated format)
    const currentQuery = `U:${input.query}\nA:`;
    
    // Construct prompt (minimal format)
    return `${systemMessage}\n${formattedHistory}\n${currentQuery}`;
  }
};

/**
 * Function-calling optimized template
 */
export const functionCallingTemplate: PromptTemplate = {
  id: 'function-calling',
  name: 'Function Calling Template',
  description: 'A template optimized for function calling scenarios',
  tags: ['function', 'tool', 'api'],
  construct: (input: PromptInput, context: PromptContext): string => {
    // System message with function calling focus
    const systemMessage = input.systemMessage || 
      'You are a helpful AI assistant with access to functions. When appropriate, use the available functions rather than generating information yourself.';
    
    // Function definitions (would typically come from context)
    const functionDefinitions = context.functionDefinitions 
      ? `\n\nAVAILABLE FUNCTIONS:\n${JSON.stringify(context.functionDefinitions, null, 2)}`
      : '';
    
    // Format history with emphasis on function calls
    const formattedHistory = context.history.length > 0
      ? '\n\nCONVERSATION HISTORY:\n' + context.history
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      : '';
    
    // Current query
    const currentQuery = `\n\nUser: ${input.query}\nAssistant:`;
    
    // Construct prompt
    return `${systemMessage}${functionDefinitions}${formattedHistory}${currentQuery}`;
  }
};

/**
 * Code generation specialized template
 */
export const codeGenerationTemplate: PromptTemplate = {
  id: 'code-generation',
  name: 'Code Generation Template',
  description: 'A template optimized for generating code in a specific language',
  tags: ['code', 'programming', 'development'],
  construct: (input: PromptInput, context: PromptContext): string => {
    // Determine language
    const language = input.language || 'javascript';
    
    // System message tailored for code generation
    const systemMessage = input.systemMessage || 
      `You are an expert programmer specializing in ${language}. Generate clean, well-documented, and efficient code.`;
    
    // Project context
    let projectContext = '';
    if (context.project) {
      projectContext = '\n\n## PROJECT CONTEXT\n' +
        `Files: ${context.project.files.join(', ')}\n` +
        (context.project.activeFile ? `Currently editing: ${context.project.activeFile}\n` : '');
    }
    
    // Existing code snippets for reference
    let existingCode = '';
    if (context.codeSnippets && context.codeSnippets.length > 0) {
      existingCode = '\n\n## EXISTING CODE\n' + context.codeSnippets.map(snippet => {
        return `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`${snippet.path ? `\nFile: ${snippet.path}` : ''}`;
      }).join('\n\n');
    }
    
    // Coding best practices for the specified language
    let bestPractices = '';
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        bestPractices = '\n\n## CODING STANDARDS\n' +
          '- Use modern ES6+ syntax\n' +
          '- Prefer const over let, avoid var\n' +
          '- Use descriptive variable and function names\n' +
          '- Add JSDoc comments for functions\n' +
          '- Handle errors appropriately';
        break;
      case 'python':
        bestPractices = '\n\n## CODING STANDARDS\n' +
          '- Follow PEP 8 style guidelines\n' +
          '- Use descriptive variable and function names\n' +
          '- Add docstrings for functions and classes\n' +
          '- Use type hints when appropriate\n' +
          '- Handle exceptions appropriately';
        break;
      // Add other languages as needed
    }
    
    // Current request
    const currentRequest = `\n\n## CODE REQUEST\n${input.query}\n\n## YOUR SOLUTION\nPlease provide the ${language} code implementation:`;
    
    // Construct prompt
    return `${systemMessage}${projectContext}${existingCode}${bestPractices}${currentRequest}`;
  }
};

/**
 * Export all templates
 */
export const allTemplates: PromptTemplate[] = [
  standardChatTemplate,
  structuredTemplate,
  compactTemplate,
  functionCallingTemplate,
  codeGenerationTemplate
];