/**
 * Bolt DIY Remediation Demo
 * 
 * This script demonstrates the usage of the enhanced Bolt DIY core components 
 * with dependency injection and AI governance integration.
 * 
 * This demo showcases:
 * 1. The main agent handling multiple types of requests
 * 2. Error handling with the centralized error handler
 * 3. Bias detection and governance capabilities
 * 4. Conversation context management
 * 5. Registration of custom tools
 */

import 'reflect-metadata';
import { container } from 'tsyringe';

// Import core components and convenience functions
import { 
  setupDependencyInjection,
  getAgent,
  Agent, 
  SentrySDK,
  ToolExecutor,
  Tool,
  IToolExecutor
} from './core';

// Import AI governance and services
import { AIGovernance } from './core/ai/governance';
import { BaseAIService } from './core/ai/base-ai-service';
import { OpenAIService } from './core/ai/openai-service';
import { AnthropicService } from './core/ai/anthropic-service';
import { GeminiService } from './core/ai/gemini-service';

// Set up the dependency injection container
setupDependencyInjection();

// Initialize Sentry for error tracking (would use actual DSN in production)
SentrySDK.initialize();

// Get the agent instance using the convenience function
const agent = getAgent();

// Get AI governance instance via DI container
const governance = container.resolve(AIGovernance);

// Get AI service instances
const primaryAiService = container.resolve<BaseAIService>('BaseAIService');
let openAiService: OpenAIService | null = null;
let anthropicService: AnthropicService | null = null;
let geminiService: GeminiService | null = null;

// Try to resolve specific services if available
try {
  if (process.env.OPENAI_API_KEY) {
    openAiService = container.resolve<OpenAIService>('OpenAIService');
    console.log('OpenAI service is available');
  }
} catch (e) {
  console.log('OpenAI service is not available');
}

try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropicService = container.resolve<AnthropicService>('AnthropicService');
    console.log('Anthropic service is available');
  }
} catch (e) {
  console.log('Anthropic service is not available');
}

try {
  if (process.env.GEMINI_API_KEY) {
    geminiService = container.resolve<GeminiService>('GeminiService');
    console.log('Google Gemini service is available');
  }
} catch (e) {
  console.log('Google Gemini service is not available');
}

// Register a custom AI model (in addition to default model)
const modelId = 'gpt-4';
governance.registerModel(modelId, {
  name: 'GPT-4',
  version: '1.0',
  provider: 'OpenAI',
  type: 'text-generation',
  description: 'Advanced language model for text generation',
  limitations: {
    contextWindow: '8K tokens',
    domainKnowledge: 'Knowledge cutoff at 2021'
  },
  biases: {
    known: ['Western cultural bias', 'English language preference']
  },
  useCases: ['Content creation', 'Code assistance', 'Documentation generation']
});

// Add additional sensitive terms for bias detection
governance.addSensitiveTerms([
  'he is better than she', 
  'mankind', 
  'fireman', 
  'policeman',
  'chairman',
  'stewardess'
]);

// Register custom tools with the tool executor
const toolExecutor = container.resolve<IToolExecutor>('IToolExecutor');

// Add a custom tool for weather information
const weatherTool: Tool = {
  name: 'getWeather',
  description: 'Get weather information for a location',
  validateArgs: (args) => typeof args.location === 'string' && args.location.length > 0,
  execute: async (args) => {
    // Simulate weather API call
    return `Weather for ${args.location}: 72°F, Sunny`;
  }
};

// Register the custom tool
(toolExecutor as ToolExecutor).registerTool(weatherTool);

// Define a unique session ID for the demo
const sessionId = `session-${Date.now()}`;

/**
 * Demonstrate a basic interaction
 */
async function demonstrateBasicInteraction() {
  console.log('\n--- Basic Interaction ---\n');
  
  const userInput = 'Tell me about the Bolt DIY project.';
  console.log(`User: ${userInput}`);
  
  try {
    const response = await agent.handleRequest(userInput, sessionId);
    console.log(`Agent: ${response}`);
    
    // Log the decision for governance
    const decisionId = governance.logDecision(modelId, {
      requestId: `req-${Date.now()}`,
      userId: 'demo-user',
      input: { query: userInput },
      output: { response },
      category: 'information-retrieval'
    });
    
    console.log(`Decision logged with ID: ${decisionId}`);
  } catch (error) {
    console.error('Error during interaction:', error);
  }
}

/**
 * Demonstrate error handling with the centralized error handler
 */
async function demonstrateErrorHandling() {
  console.log('\n--- Error Handling ---\n');
  
  const userInput = 'This will trigger an error_trigger in the simulation';
  console.log(`User: ${userInput}`);
  
  try {
    const response = await agent.handleRequest(userInput, sessionId);
    console.log(`Agent: ${response}`);
  } catch (error) {
    console.error('Unexpected error during error handling demo:', error);
  }
}

/**
 * Demonstrate bias detection and governance capabilities
 */
async function demonstrateBiasDetection() {
  console.log('\n--- Bias Detection ---\n');
  
  const textToAnalyze = 'The chairman made a decision and the policeman enforced it. Mankind benefits from these rules.';
  console.log(`Analyzing text for bias: "${textToAnalyze}"`);
  
  const biasAnalysis = governance.analyzeTextForBias(textToAnalyze);
  
  if (biasAnalysis.biasDetected) {
    console.log(`Bias detected! Found terms: ${biasAnalysis.terms.join(', ')}`);
    
    // Report bias
    const decisionId = 'demo-decision-id';
    const biasReportId = governance.reportBias(modelId, decisionId, {
      userId: 'demo-user',
      type: 'gender-bias',
      description: 'Usage of gendered terms for professional roles',
      evidence: textToAnalyze
    });
    
    console.log(`Bias report created with ID: ${biasReportId}`);
    
    // Update report status
    const updatedReport = governance.updateBiasReport(
      biasReportId,
      'investigating',
      'Investigating the bias report and planning remediation.'
    );
    
    console.log(`Bias report updated to status: ${updatedReport?.status}`);
  } else {
    console.log('No bias detected in the text.');
  }
}

/**
 * Demonstrate conversation context management
 */
async function demonstrateConversation() {
  console.log('\n--- Conversation Context Management ---\n');
  
  const conversationSessionId = `conversation-${Date.now()}`;
  const turns = [
    'Hello, my name is Alex.',
    'What can you tell me about AI governance?',
    'How does bias detection work?',
    'Can you use the getWeather tool to check the weather in San Francisco?'
  ];
  
  for (const userInput of turns) {
    console.log(`User: ${userInput}`);
    
    try {
      const response = await agent.handleRequest(userInput, conversationSessionId);
      console.log(`Agent: ${response}`);
    } catch (error) {
      console.error('Error during conversation:', error);
    }
  }
}

/**
 * Demonstrate the primary AI service abstraction
 */
async function demonstrateAIService() {
  console.log('\n--- Primary AI Service ---\n');
  
  try {
    // Get available models
    console.log('Available AI Models:');
    const getModels = primaryAiService.getAvailableModels;
    if (getModels) {
      const models = await getModels.call(primaryAiService);
      if (models && models.length > 0) {
        console.table(models.map(model => ({
          ID: model.id,
          Provider: model.provider,
          Name: model.name,
          Context: `${model.contextWindow} tokens`,
          SupportsFunctions: model.supportsFunctions ? '✓' : '✗',
          SupportsImages: model.supportsImages ? '✓' : '✗',
        })));
      } else {
        console.log('No models available or returned from service');
      }
    } else {
      console.log('getAvailableModels method not available on the AI service');
    }
    
    // Simple text completion
    const prompt = 'Explain the benefits of abstraction in software architecture in 3 bullet points.';
    console.log(`\nGeneration Prompt: "${prompt}"`);
    
    const completion = await primaryAiService.generateCompletion(prompt, {
      temperature: 0.5,
      systemPrompt: 'You are a software architecture expert. Keep your explanations concise and focused.'
    });
    
    console.log('\nGenerated Completion:');
    console.log(completion);
    
    // Code analysis
    const codeToAnalyze = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}
    `;
    
    console.log('\nCode Analysis:');
    const analysis = await primaryAiService.analyzeCode(codeToAnalyze, 'javascript');
    console.log(JSON.stringify(analysis, null, 2));
    
    // Function calling capabilities check
    console.log('\nAI Service Capabilities:');
    const supportsFn = primaryAiService.supportsCapability;
    if (supportsFn) {
      console.log(`Image Generation: ${supportsFn.call(primaryAiService, 'image_generation') ? '✓' : '✗'}`);
      console.log(`Function Calling: ${supportsFn.call(primaryAiService, 'function_calling') ? '✓' : '✗'}`);
      console.log(`JSON Mode: ${supportsFn.call(primaryAiService, 'json_mode') ? '✓' : '✗'}`);
    } else {
      console.log('Capability checking not available on the AI service');
    }
    
  } catch (error) {
    console.error('Error demonstrating AI Service:', error);
  }
}

/**
 * Demonstrate Gemini AI capabilities
 */
async function demonstrateGemini() {
  console.log('\n--- Google Gemini Capabilities ---\n');
  
  // Only run this demo if Gemini service is available
  if (!geminiService) {
    console.log('This demo requires the Google Gemini service to be available');
    console.log('Ensure you have set the GEMINI_API_KEY environment variable.');
    return;
  }
  
  try {
    // Check available models
    console.log('Available Gemini Models:');
    const geminiModels = await geminiService.getAvailableModels?.();
    if (geminiModels && geminiModels.length > 0) {
      console.table(geminiModels.map(model => ({
        ID: model.id,
        Provider: model.provider,
        Name: model.name,
        Context: `${model.contextWindow} tokens`,
        SupportsFunctions: model.supportsFunctions ? '✓' : '✗',
        SupportsImages: model.supportsImages ? '✓' : '✗',
      })));
    } else {
      console.log('No Gemini models available');
    }
    
    // Simple text completion
    const prompt = 'Explain three differences between generative and discriminative machine learning models.';
    console.log(`\nGemini Generation Prompt: "${prompt}"`);
    
    const completion = await geminiService.generateCompletion(prompt, {
      temperature: 0.5,
      systemPrompt: 'You are an AI expert giving concise technical explanations.'
    });
    
    console.log('\nGenerated Completion from Gemini:');
    console.log(completion);
    
    // Code analysis
    const codeToAnalyze = `
import React, { useState, useEffect } from 'react';

function DataFetcher({ url }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error \${response.status}\`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

export default DataFetcher;
    `;
    
    console.log('\nGemini Code Analysis:');
    const analysis = await geminiService.analyzeCode(codeToAnalyze, 'javascript');
    console.log(JSON.stringify(analysis, null, 2));
    
    // Function calling capabilities check
    console.log('\nGemini Service Capabilities:');
    const supportsFn = geminiService.supportsCapability;
    if (supportsFn) {
      console.log(`Image Generation: ${supportsFn.call(geminiService, 'image_generation') ? '✓' : '✗'}`);
      console.log(`Function Calling: ${supportsFn.call(geminiService, 'function_calling') ? '✓' : '✗'}`);
      console.log(`JSON Mode: ${supportsFn.call(geminiService, 'json_mode') ? '✓' : '✗'}`);
    } else {
      console.log('Capability checking not available on the Gemini service');
    }
    
  } catch (error) {
    console.error('Error demonstrating Gemini Service:', error);
  }
}

/**
 * Demonstrate multi-provider capability with OpenAI and Anthropic
 */
async function demonstrateMultiProvider() {
  console.log('\n--- Multi-Provider Capability ---\n');
  
  // Only run this demo if both services are available
  if (!openAiService || !anthropicService) {
    console.log('This demo requires both OpenAI and Anthropic services to be available');
    
    if (!openAiService) console.log('Missing OpenAI service');
    if (!anthropicService) console.log('Missing Anthropic service');
    
    return;
  }
  
  try {
    // Define a prompt for comparison
    const prompt = 'What are three major differences between transformer and RNN architectures?';
    console.log(`Comparing responses to: "${prompt}"\n`);
    
    // Get responses from both models
    console.log('Generating responses from both models...');
    const [openaiResponse, anthropicResponse] = await Promise.all([
      openAiService.generateCompletion(prompt, {
        systemPrompt: 'You are an AI expert giving concise technical explanations.',
        temperature: 0.3
      }),
      anthropicService.generateCompletion(prompt, {
        systemPrompt: 'You are an AI expert giving concise technical explanations.',
        temperature: 0.3
      })
    ]);
    
    // Display the responses
    console.log('\n--- OpenAI Response ---');
    console.log(openaiResponse);
    
    console.log('\n--- Anthropic Response ---');
    console.log(anthropicResponse);
    
    // Code analysis comparison
    const codeToAnalyze = `
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
    `;
    
    console.log('\nComparing code analysis capabilities...');
    
    const [openaiAnalysis, anthropicAnalysis] = await Promise.all([
      openAiService.analyzeCode(codeToAnalyze, 'javascript'),
      anthropicService.analyzeCode(codeToAnalyze, 'javascript').catch(e => {
        return { error: e.message, summary: "Error in analysis" };
      })
    ]);
    
    console.log('\n--- OpenAI Code Analysis ---');
    console.log(JSON.stringify(openaiAnalysis, null, 2));
    
    console.log('\n--- Anthropic Code Analysis ---');
    console.log(JSON.stringify(anthropicAnalysis, null, 2));
    
    // Compare models available
    const openaiModels = await openAiService.getAvailableModels?.();
    const anthropicModels = await anthropicService.getAvailableModels?.();
    
    console.log('\n--- Available Models Comparison ---');
    console.log('OpenAI offers', openaiModels?.length || 0, 'models');
    console.log('Anthropic offers', anthropicModels?.length || 0, 'models');
    
  } catch (error) {
    console.error('Error during multi-provider demo:', error);
  }
}

/**
 * Run all demos in sequence
 */
async function runDemos() {
  try {
    // Check if we have the necessary API keys
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.log('\n⚠️ OpenAI API key not found! Some demos will be skipped.');
      console.log('Please set the OPENAI_API_KEY environment variable to run the AI service demos.');
    }
    
    await demonstrateBasicInteraction();
    await demonstrateErrorHandling();
    await demonstrateBiasDetection();
    await demonstrateConversation();
    
    // Only run AI service demos if we have an API key
    if (openaiApiKey) {
      await demonstrateAIService();
    }
    
    // Run Gemini demo if API key is available
    if (process.env.GEMINI_API_KEY) {
      await demonstrateGemini();
    }
    
    // Display governance data
    console.log('\n--- Governance Data Summary ---\n');
    console.log('Model Metadata:', JSON.stringify(governance.getModelMetadata(modelId), null, 2));
    console.log('Decisions Count:', governance.getDecisionsByModel(modelId).length);
    console.log('Bias Reports Count:', governance.getBiasReportsByModel(modelId).length);
    console.log('Audit Log Entries:', governance.getAuditLog().length);
    
    // Display tool information
    console.log('\n--- Registered Tools ---\n');
    const tools = [
      { name: 'getCurrentTime', description: 'Get the current server time' },
      { name: 'getWeather', description: 'Get weather information for a location' }
    ];
    console.table(tools);
    
    // List the available AI services
    console.log('\n--- Available AI Services ---\n');
    console.log('- OpenAI Service: Complete set of AI capabilities powered by GPT-4o');
    console.log('- Anthropic Claude Service: Advanced AI capabilities powered by Claude 3');
    console.log('- Google AI / Gemini Service: Advanced AI capabilities powered by Gemini');
    console.log('- Future: DeepSeek Service (coming soon)');
    console.log('- Future: OpenRouter Service (coming soon)');
  } catch (error) {
    console.error('Error running demos:', error);
  }
}

// Run all the demos
console.log('🚀 Starting Bolt DIY Demo with Enhanced DI Container');
runDemos().then(() => {
  console.log('\n✅ Demo completed successfully!');
}).catch(error => {
  console.error('❌ Demo failed:', error);
});