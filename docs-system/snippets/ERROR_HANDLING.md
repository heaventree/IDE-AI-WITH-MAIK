# Error Handling Patterns

This document outlines best practices and patterns for handling errors in applications.

## General Principles

1. **Be Specific**: Error messages should be specific and actionable.
2. **Fail Fast**: Detect and report errors as early as possible.
3. **Graceful Degradation**: Applications should continue functioning even when parts fail.
4. **User-Friendly**: Error messages shown to users should be helpful and non-technical.
5. **Detailed Logging**: Log detailed error information for debugging.
6. **Centralized Handling**: Implement centralized error handling when possible.

## Frontend Error Handling

### Error Boundaries

Error boundaries are React components that catch JavaScript errors in their child component tree, log those errors, and display a fallback UI.

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
// <ErrorBoundary fallback={<CustomErrorComponent />}>
//   <ComponentThatMightError />
// </ErrorBoundary>
