# Bolt DIY Core Architecture

## Overview

The Bolt DIY Core Architecture provides a modular, robust foundation for the Bolt DIY system. This architecture addresses key challenges identified in the remediation plan, focusing on memory optimization, token efficiency, and context window management.

## Core Components

### Agent System

The Agent component orchestrates the processing of user requests through various components:

- **Agent** (`agent/agent.ts`): The central orchestrator that processes user requests
- **State Manager** (`agent/state-manager.ts`): Manages application state across interactions

### Memory System

The Memory System provides efficient storage and retrieval of conversation history:

- **Memory Manager** (`memory/memory-manager.ts`): Maintains short-term and long-term memory
- Context-aware retrieval based on semantic relevance
- Configurable memory capacity to prevent overflow

### Prompt Management

The Prompt Management system optimizes language model interactions:

- **Prompt Manager** (`prompt/prompt-manager.ts`): Constructs optimized prompts for LLMs
- Token count estimation and optimization
- Context window management to prevent overflows

### Tool Execution

The Tool Execution framework provides a way to invoke tools and functions:

- **Tool Executor** (`tools/tool-executor.ts`): Processes LLM responses to execute tools
- Tool registration mechanism
- Argument validation and error handling

### Error Handling

The Error Handling system provides centralized error processing:

- **Error Handler** (`error-handler.ts`): Processes and monitors errors
- Custom error types for different failure scenarios
- Integration with monitoring systems (Sentry)
- User-friendly error messages

### AI Governance

The AI Governance module ensures ethical and transparent AI usage:

- **AI Governance** (`ai/governance.ts`): Provides governance, ethics, and bias mitigation
- Model registration and metadata tracking
- Decision logging for auditability
- Bias detection and reporting

### Monitoring

The Monitoring system tracks system health and performance:

- **Sentry SDK** (`monitoring/sentry-sdk.ts`): Error tracking and monitoring
- **Performance Monitor** (`monitoring/index.ts`): Request timing and performance metrics

## Architecture Principles

1. **Modularity**: Each component has a single responsibility and well-defined interfaces
2. **Testability**: Clean dependency injection for better unit testing
3. **Observability**: Comprehensive error tracking and performance monitoring
4. **Resilience**: Graceful degradation under failure conditions
5. **Governance**: Transparent and ethical AI decision tracking

## Using the Core Architecture

### Initializing the System

```typescript
import { initializeSystem } from './core';

// Initialize the system
const agent = initializeSystem();
```

### Processing User Requests

```typescript
// Create a unique session ID for the user
const sessionId = `user-${userId}-${Date.now()}`;

// Process a user request
const response = await agent.handleRequest(userInput, sessionId);
```

### Managing Dependencies

The system uses `tsyringe` for dependency injection:

```typescript
import { container } from 'tsyringe';
import { AIGovernance } from './core/ai/governance';

// Resolve a component from the container
const governance = container.resolve(AIGovernance);
```

## Contributing

### Adding a New Component

1. Define the component interface in `interfaces/index.ts`
2. Implement the component in its dedicated module
3. Register the component in the DI container (`di-container.ts`)
4. Update the exports in `index.ts` to make it available

### Error Handling Guidelines

1. Use custom error types from `errors/index.ts` for specific failures
2. Include context information with all errors
3. Catch errors at component boundaries
4. Use the centralized `ErrorHandler` for consistent processing

## Folder Structure

```
core/
├── agent/                # Agent-related components
│   ├── agent.ts          # Main agent class
│   └── state-manager.ts  # State management
├── ai/                   # AI-related components
│   └── governance.ts     # AI governance module
├── errors/               # Error definitions
│   └── index.ts          # Custom error types
├── interfaces/           # Interface definitions
│   └── index.ts          # Core interfaces
├── memory/               # Memory management
│   └── memory-manager.ts # Memory management
├── monitoring/           # Monitoring tools
│   ├── index.ts          # Monitoring exports
│   ├── performance-monitor.ts # Performance monitoring
│   └── sentry-sdk.ts     # Sentry integration
├── prompt/               # Prompt management
│   └── prompt-manager.ts # Prompt construction
├── tools/                # Tool execution
│   └── tool-executor.ts  # Tool execution
├── di-container.ts       # Dependency injection setup
├── error-handler.ts      # Centralized error handling
└── index.ts              # Core module exports
```

## References

- [Remediation Integration Document](../project_management/REMEDIATION_INTEGRATION.md)
- [Migration Guide](../project_management/MIGRATION_GUIDE.md)
- [Level 3 Remediation Plan](../docs-system/remediation/Level_3_Remediation_Plan.md)