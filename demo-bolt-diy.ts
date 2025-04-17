/**
 * Bolt DIY Remediation Demo
 * 
 * This script demonstrates the usage of the Bolt DIY core components
 * and the integration with AI governance.
 */

import 'reflect-metadata';
import { container } from 'tsyringe';

// Import core components
import { 
  initializeSystem, 
  Agent, 
  ErrorHandler,
  SentrySDK,
  InMemoryStateManager,
  AdvancedMemoryManager,
  PromptManager,
  ToolExecutor,
  Tool
} from './core';

// Import AI governance
import { AIGovernance } from './core/ai/governance';

// Initialize Sentry (would use actual DSN in production)
SentrySDK.initialize();

// Retrieve the agent instance
const agent = initializeSystem();

// Get AI governance instance
const governance = container.resolve(AIGovernance);

// Register an AI model
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

// Add sensitive terms for bias detection
governance.addSensitiveTerms([
  'he is better than she', 
  'mankind', 
  'fireman', 
  'policeman',
  'chairman',
  'stewardess'
]);

// Define a session ID for the demo
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
 * Demonstrate error handling
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
 * Demonstrate bias detection
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
 * Demonstrate multiple turns of conversation
 */
async function demonstrateConversation() {
  console.log('\n--- Conversation Context ---\n');
  
  const conversationSessionId = `conversation-${Date.now()}`;
  const turns = [
    'Hello, my name is Alex.',
    'What can you tell me about AI governance?',
    'How does bias detection work?'
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
 * Run the demos
 */
async function runDemos() {
  try {
    await demonstrateBasicInteraction();
    await demonstrateErrorHandling();
    await demonstrateBiasDetection();
    await demonstrateConversation();
    
    // Display governance data
    console.log('\n--- Governance Data ---\n');
    console.log('Model Metadata:', JSON.stringify(governance.getModelMetadata(modelId), null, 2));
    console.log('Decisions:', governance.getDecisionsByModel(modelId).length);
    console.log('Bias Reports:', governance.getBiasReportsByModel(modelId).length);
    console.log('Audit Log:', governance.getAuditLog().length);
  } catch (error) {
    console.error('Error running demos:', error);
  }
}

// Run all the demos
runDemos().then(() => {
  console.log('\nDemo completed successfully!');
}).catch(error => {
  console.error('Demo failed:', error);
});