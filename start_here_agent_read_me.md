# 🚨 ATTENTION ALL AI AGENTS 🚨

## REDIRECT NOTICE: You are in the wrong location

**CRITICAL INFORMATION:** All documentation work MUST happen within the `docs-system` directory using the Task Manager system.

## REQUIRED ACTIONS:

1. **STOP working in this location immediately**
2. **Navigate to the `docs-system` directory**
3. **Use the Documentation Task Manager at: [/docs-system/task_manager.html](/docs-system/task_manager.html)**

## ⚠️ WARNING ⚠️

Any files created outside the `docs-system` directory structure will not be integrated correctly into the documentation system and will need to be redone.

### Correct File Structure:

All documentation files should be created within these directories:
- `/docs-system/templates/`
- `/docs-system/handover/`
- `/docs-system/architecture/`
- Other appropriate subdirectories within `docs-system`

### Do Not:
- Create files or directories at the root level
- Create your own directory structure
- Bypass the Task Manager system

## Proceed to the Documentation System:

[Click here to go to the Documentation System](/docs-system/)

---

*If you're seeing this file, you've accessed the project at its root level. Please navigate to the proper documentation system as instructed above.*

# Documentation System

## Overview

The Documentation System is a sophisticated documentation management system that leverages clean architecture principles to streamline enterprise-level content creation, validation, and quality assurance processes. It serves as a reusable boilerplate template structure for software project documentation.

## Purpose

This system provides:

1. **Standardized Documentation Templates**: Reusable templates for all aspects of software documentation
2. **Clean Architecture Framework**: A modular, maintainable architecture following domain-driven design principles
3. **Agent-Optimized Structure**: Clear organization that helps AI agents generate and maintain documentation
4. **Quality Assurance Tools**: Built-in validation and quality checks for documentation
5. **Workflows**: Structured processes for document creation, review, and publication

## Getting Started

### For AI Agents

If you're an AI agent working with this system:

1. Start by reading the [Agent Initialization Guide](/agent/agent_init.md)
2. Review the [Agent Roles](/agent/roles.md) to understand your responsibilities
3. Follow the [Commit Format Guidelines](/docs/commit-format.md) for version control
4. Use the established [Placeholder Syntax](/templates/README.md#placeholder-syntax) for incomplete sections

### For Human Users

If you're a human user of this system:

1. Browse the [Directory Structure](#directory-structure) to understand the system organization
2. Check the [Templates](/templates/) for standardized document formats
3. View the [Documentation Guidelines](/docs/documentation_guidelines.md) for best practices
4. Use the web interface by starting the server with `cd docs-system && python -m http.server 5000`

## Directory Structure

```
docs-system/
├── agent/                  # AI agent configuration and guidance
│   ├── agent_init.md       # Getting started guide for agents
│   └── roles.md            # Agent roles and responsibilities
├── architecture/           # Clean architecture implementation
│   ├── application/        # Application services and use cases
│   ├── core/               # Core domain models and business logic
│   ├── infrastructure/     # External integrations and implementations
│   └── interfaces/         # API and UI components
├── audit_reports/          # Documentation quality audit reports
├── docs/                   # Documentation about the system itself
│   ├── commit-format.md    # Guidelines for commit messages
│   └── documentation_guidelines.md  # Standards for documentation
├── templates/              # Standardized document templates
│   ├── project_overview.md # Template for project overviews
│   ├── technical_spec.md   # Template for technical specifications
│   └── user_guide.md       # Template for user guides
└── index.html              # Web interface entry point
```

## Key Features

- **Document Management**: Create, update, and publish documents
- **Version Control**: Track and manage document versions
- **Workflow Management**: Manage document workflows from creation to publication
- **Event-Driven Architecture**: Loose coupling through domain events
- **Validation**: Comprehensive validation at all layers
- **Error Handling**: Robust error handling across the system

## Architecture

The system follows clean architecture principles with distinct layers:

1. **Core Domain Layer**: Contains business entities, value objects, and domain logic
2. **Application Layer**: Contains application services, use cases, and DTOs
3. **Infrastructure Layer**: Contains implementations of repositories, services, and external integrations
4. **Interfaces Layer**: Contains API routes, controllers, and UI components

## Development Guidelines

When extending or modifying the Documentation System:

1. **Follow Clean Architecture**: Keep concerns separated between layers
2. **Use Domain-Driven Design**: Focus on the domain model and business rules
3. **Maintain Modularity**: Ensure components are loosely coupled
4. **Write Tests**: Cover critical functionality with tests
5. **Update Documentation**: Keep documentation in sync with code changes

## Contributing

Contributions to the Documentation System should:

1. Follow the established architecture and patterns
2. Include appropriate documentation updates
3. Adhere to the commit message format
4. Pass all existing tests and include new tests as needed
5. Be reviewed by the appropriate agent role owner

## License

<!-- AGENT_PLACEHOLDER: Add appropriate license information -->

---

*This Documentation System is designed as a world-leading blueprint for software documentation with enterprise-grade stability and a clear roadmap for future development.*