# MAIK-AI-CODING-APP - Coding Standards

## General Principles

- **Readability First**: Optimize for readability and maintainability
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until necessary
- **Consistency**: Follow established patterns and conventions

## Code Style

### General Guidelines

- Use meaningful and descriptive names
- Keep functions small and focused on a single task
- Limit line length to 100 characters
- Use consistent indentation (2 spaces)
- Add appropriate comments for complex logic
- Organize imports in a consistent manner
- Remove unused code, imports, and variables

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | userData, apiResponse, isValid |
| Functions | camelCase, action verbs first | getUserData(), validateInput(), formatResponse() |
| Classes | PascalCase, nouns | UserManager, ApiClient, ErrorHandler |
| Interfaces | PascalCase with 'I' prefix | IUserData, IApiResponse, IErrorDetails |
| Constants | UPPER_SNAKE_CASE | API_URL, MAX_RETRIES, DEFAULT_TIMEOUT |
| Enums | PascalCase, singular nouns | ErrorType, UserRole, LogLevel |
| File names | kebab-case for files, PascalCase for component files | api-client.ts, UserManager.tsx, error-types.ts |

### Frontend Code Style

#### HTML

```html
<!-- Example of well-formatted HTML -->
<Button
  variant="primary"
  onClick={handleSubmit}
  disabled={isLoading}
>
  Submit
</Button>
