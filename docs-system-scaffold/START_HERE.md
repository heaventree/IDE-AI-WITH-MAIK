# START HERE: Agent Guide

## Single Source of Truth

All agents - both new and departing - must use the following as their primary reference document:

**[PROJECT STATUS - ALWAYS CHECK THIS FIRST](/handover/PROJECT_STATUS.md)**

This document is the single source of truth for the current state of the project, implementation priorities, and next steps.

## Your First 30 Minutes: Immediate Next Steps

**STOP AND FOLLOW THESE STEPS IN ORDER:**

### Step 1: Understand the Core Principles (5 minutes)
- You are working on a Documentation System with specific requirements and architecture
- The system is designed with the principle of "total and complete ignorance" in mind
- All work must follow clean architecture principles and task-driven workflows
- **UI DEVELOPMENT MUST ALWAYS COME FIRST** - No functional code before UI implementation

### Step 2: Access the Task Manager (3 minutes)
- **[GO TO THE TASK MANAGER HERE](/task_manager.html)**
- The Task Manager is your primary interface for all project work
- It provides step-by-step guidance for implementing features and documenting your work

### Step 3: Review Essential Documents (15 minutes)
- [Project Status](/handover/PROJECT_STATUS.md) - SINGLE SOURCE OF TRUTH for project state
- [Project Design Brief](/handover/design_briefs/EXAMPLE_DESIGN_BRIEF.md) - Core purpose and architecture
- [Implementation Priorities](/handover/IMPLEMENTATION_PRIORITIES.md) - Prioritized task list with detailed specs
- [Technical Implementation Guide](/handover/TECHNICAL_IMPLEMENTATION_GUIDE.md) - Concrete implementation patterns
- [Latest Handover Document](/handover/completed/HANDOVER_SUMMARY_APRIL17_2025.md) - Most recent handover summary

### Step 4: Start Your First Task (15 minutes)
- In the Task Manager, navigate to the current task
- Review all requirements and acceptance criteria
- Locate the specific files you'll need to modify (paths are provided in Implementation Priorities)
- Follow the implementation guidance for your first task

## Reference Documents

### For Implementation
- [Technical Implementation Guide](/handover/TECHNICAL_IMPLEMENTATION_GUIDE.md) - Detailed development patterns
- [Troubleshooting Guide](/handover/TROUBLESHOOTING.md) - Solutions for common issues
- [API Documentation](/api/API_DOCUMENTATION.md) - API reference (may be incomplete)

### For Architecture Understanding
- [System Architecture](/architecture/ARCHITECTURE.md) - Detailed component descriptions
- [Project Design Brief](/handover/design_briefs/EXAMPLE_DESIGN_BRIEF.md) - High-level system design

### For Process Understanding
- [Agent Onboarding Guide](/handover/design_briefs/AGENT_ONBOARDING_GUIDE.md) - Essential instructions
- [Handover Process](/handover/HANDOVER_PROCESS.md) - Process for creating handovers
- [Handover Template](/handover/HANDOVER_TEMPLATE.md) - Template for creating handovers
- [Handover Checklist](/handover/HANDOVER_CHECKLIST.md) - Quality verification for handovers

## Common Questions

### "What should I work on first?"
The [Implementation Priorities](/handover/IMPLEMENTATION_PRIORITIES.md) document contains a numbered list of tasks in priority order. Always start with Task #1 unless instructed otherwise.

### "How do I know if I'm doing it right?"
Each task has specific acceptance criteria. After implementing a feature, validate it against these criteria before moving on.

### "Where do I find the code I need to modify?"
Each task in the Implementation Priorities document includes specific file paths and locations for code changes.

### "What do I do when leaving the project?"
1. Update the [Project Status](/handover/PROJECT_STATUS.md) document with your latest progress
2. Create a handover document in `/docs-system/handover/completed/` using the [Handover Template](/handover/HANDOVER_TEMPLATE.md)
3. Verify your handover against the [Handover Checklist](/handover/HANDOVER_CHECKLIST.md)

## Next Actions Checklist

- [ ] Read the Project Status document
- [ ] Access the Task Manager
- [ ] Review the Implementation Priorities
- [ ] Understand the current task's acceptance criteria
- [ ] Review the Technical Implementation Guide
- [ ] Locate the specific files for implementation
- [ ] Implement the task following the provided patterns
- [ ] Validate against acceptance criteria
- [ ] Document your changes

**IMPORTANT:** If you have any questions or uncertainties after following these steps, check the [Troubleshooting Guide](/handover/TROUBLESHOOTING.md) before asking for assistance.