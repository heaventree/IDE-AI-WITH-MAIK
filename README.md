# Bolt DIY Implementation

This repository contains an enhanced version of the Bolt DIY core implementation with improved dependency injection, error handling, and AI integration.

## Project Overview

The Bolt DIY system provides a flexible and extensible foundation for building AI-powered applications with strong governance capabilities. Key features include:

- Multi-provider AI integration (OpenAI, Anthropic, Google Gemini)
- Dependency injection for better modularity and testing
- Centralized error handling with monitoring
- Conversation context management
- Custom tool registration and execution

## Reference Servers

For assistance with development and debugging, this project includes two reference server implementations:

### 1. Bolt Reference Server (Port 5001)

This server provides a reference implementation of the Bolt DIY system with a file explorer interface to view the codebase and run demo scripts.

To start this server:
```bash
./start_reference_server.sh
```

### 2. Main Reference Server (Port 5002)

A simpler reference implementation designed for comparison with the main project.

### Starting Both Servers

You can start both reference servers at once with:
```bash
./start_all_reference_servers.sh
```

## Development

Key files in the implementation:

- `demo-bolt-diy.ts` - Demo script showcasing core functionality
- `core/di-container.ts` - Dependency injection container setup
- `core/error-handler.ts` - Centralized error handling
- `core/ai/*.ts` - AI service implementations for different providers

## Running the Demo

You can run the demo script directly with:
```bash
npx tsx demo-bolt-diy.ts
```

Or use one of the reference servers to execute it through the web interface.