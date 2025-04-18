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

// Import AI governance
import { AIGovernance } from './core/ai/governance';

// Set up the dependency injection container
setupDependencyInjection();

// Initialize Sentry for error tracking (would use actual DSN in production)
SentrySDK.initialize();

// Get the agent instance using the convenience function
const agent = getAgent();

// Get AI governance instance via DI container
const governance = container.resolve(AIGovernance);

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
 * Run all demos in sequence
 */
async function runDemos() {
  try {
    await demonstrateBasicInteraction();
    await demonstrateErrorHandling();
    await demonstrateBiasDetection();
    await demonstrateConversation();
    
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