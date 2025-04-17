# Commit Message Format Guidelines

## Overview

This document defines the standard format for commit messages in the Documentation System repository. Following these guidelines ensures clear communication of changes, facilitates easier code review, and enables automated tooling for release management.

## Commit Message Structure

Each commit message should follow this format:

```
<type>(<scope>): <short summary>

<body>

<footer>
```

### Elements

- **Type**: Identifies the kind of change
- **Scope** (optional): Specifies the component affected
- **Summary**: Brief description of the change (imperative, present tense)
- **Body** (optional): Detailed explanation of the change
- **Footer** (optional): References to issues, breaking changes, etc.

## Types

Choose one of the following types for your commit:

- **docs**: Documentation changes
- **feat**: New features
- **fix**: Bug fixes
- **refactor**: Code changes that neither fix bugs nor add features
- **style**: Changes that don't affect code functionality (formatting, etc.)
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks, dependency updates, etc.
- **perf**: Performance improvements
- **ci**: Changes to CI/CD configuration
- **build**: Changes to build process or tools
- **revert**: Reverts a previous commit

## Scopes

Common scopes include:

- **domain**: Core domain model
- **app**: Application layer
- **infra**: Infrastructure components
- **api**: API interfaces
- **ui**: User interface
- **template**: Documentation templates
- **audit**: Audit-related components
- **agent**: AI agent related changes
- **deps**: Dependencies

## Examples

### Documentation Update

```
docs(template): update technical specification template

- Add section for architectural decisions
- Improve formatting for better readability
- Include example usage

Closes #123
```

### Feature Addition

```
feat(domain): implement document versioning

Add version tracking to Document entity with:
- Version number increments on updates
- Creation timestamp for each version
- Diff generation between versions

Closes #456
```

### Bug Fix

```
fix(api): resolve document search pagination issue

Fix incorrect count calculation in document search results
that caused pagination to show incorrect page numbers.

Fixes #789
```

### Refactoring

```
refactor(infra): improve error handling in document repository

Replace direct error throws with structured Result objects
that provide better context and improve error traceability.
```

## Guidelines for AI Agents

When creating commit messages:

1. **Be Specific**: Clearly describe what changed and why
2. **Be Concise**: Keep the summary line under 72 characters
3. **Use Imperative Mood**: Write as if giving a command (e.g., "add" not "added")
4. **Reference Issues**: Always reference related issues in the footer
5. **Separate Concerns**: Make each commit focused on a single change
6. **Describe Why**: Explain the reasoning behind significant changes
7. **Be Consistent**: Follow these guidelines for all commits

## Automated Validation

Commit messages will be automatically validated against these guidelines. Commits that don't follow the format may be rejected.

## Example Workflow

1. Make changes to files
2. Stage changes for commit
3. Create a commit message following the format
4. Push the changes
5. Reference the commit in related documentation or issues

---

*Following these commit message guidelines helps maintain a clean and informative git history that serves as additional documentation for the project.*