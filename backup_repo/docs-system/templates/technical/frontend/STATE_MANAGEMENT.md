# State Management Best Practices

## Overview

This document outlines the state management patterns and best practices for {{PROJECT_NAME}}. Proper state management is crucial for building maintainable, predictable, and performant frontend applications.

## State Management Architecture

### Core Principles

1. **Single Source of Truth**: State should be stored in a single, authoritative location
2. **Immutable State**: State should never be directly modified, only replaced with new values
3. **Unidirectional Data Flow**: State changes follow a predictable, one-way path
4. **Minimal State**: Only essential application state should be stored centrally
5. **Derived State**: Computed values should be derived from core state, not duplicated

### State Categories

State in the application is categorized as:

1. **UI State**: Temporary visual state (open/closed panels, active tabs, etc.)
2. **Form State**: User input and form validation status
3. **Entity State**: Domain data retrieved from backend services
4. **Session State**: User authentication and preferences
5. **Application State**: Global settings and configuration

## State Management Solution

{{PROJECT_NAME}} uses {{STATE_MANAGEMENT_SOLUTION}} for state management with the following architecture:

### Store Configuration

The store is structured as follows:

```js
// Example store structure
{
  entities: {
    users: {...},
    products: {...},
    orders: {...}
  },
  ui: {
    theme: 'light',
    sidebar: 'expanded',
    activeModal: null
  },
  forms: {
    userProfile: {...},
    checkout: {...}
  },
  session: {
    user: {...},
    permissions: [...],
    settings: {...}
  },
  app: {
    version: '1.0.0',
    features: {...},
    status: 'ready'
  }
}
```

### State Access Patterns

State should be accessed following these patterns:

- **Selectors**: Use memoized selector functions to access state
- **Component Binding**: Connect components only to the state they need
- **State Isolation**: Keep component-specific state local when possible

## State Management Patterns

### Entity Management

#### Entity Storage

Entities are stored using a normalized pattern:

```js
{
  entities: {
    users: {
      byId: {
        'user-1': { id: 'user-1', name: 'John Doe', ... },
        'user-2': { id: 'user-2', name: 'Jane Smith', ... }
      },
      allIds: ['user-1', 'user-2'],
      status: 'loaded',
      error: null
    }
  }
}
```

#### Entity Actions

Entity state changes follow these patterns:

- **CRUD Operations**: Create, read, update, delete actions for each entity type
- **Loading States**: Request, success, and failure actions for async operations
- **Batch Operations**: Efficient handling of multiple entity changes

### Form Management

#### Form State Structure

Form state follows this pattern:

```js
{
  forms: {
    userProfile: {
      values: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      touched: {
        firstName: true,
        lastName: true,
        email: false
      },
      errors: {
        email: 'Invalid email format'
      },
      status: 'editing',
      dirty: true,
      valid: false
    }
  }
}
```

#### Form State Lifecycle

- **Initialization**: Pre-filling forms with existing data
- **Validation**: Real-time and submission validation strategies
- **Submission**: Handling submission, success, and errors
- **Reset/Clear**: Clearing form state after submission or cancellation

### UI State Management

UI state should follow these guidelines:

- **Component-Level State**: Use local state for UI elements only relevant to a single component
- **Shared UI State**: Only elevate UI state to global store when shared across components
- **Persistence Needs**: Consider storage requirements when determining state location

### Asynchronous Actions

Asynchronous operations follow this pattern:

1. **Request Action**: Indicates operation start and sets loading state
2. **Success Action**: Updates state with received data
3. **Failure Action**: Stores error information for display and recovery
4. **Reset/Clear Action**: Cleans up after operation completion

## State Access in Components

### Component Architecture

Components should be categorized as:

- **Container Components**: Connect to state and pass data to presentational components
- **Presentational Components**: Receive props and render UI without direct state access
- **Custom Hooks**: Encapsulate state logic for reuse across components

### State Access Example

```jsx
// Container Component Example
function UserProfileContainer() {
  // Access global state
  const user = useSelector(state => selectUserById(state, userId));
  const status = useSelector(state => selectUserLoadingStatus(state));
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Dispatch action to load user data
    if (!user && status !== 'loading') {
      dispatch(fetchUser(userId));
    }
  }, [userId, user, status, dispatch]);
  
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  // Pass data as props to presentational component
  return <UserProfile user={user} />;
}

// Presentational Component Example
function UserProfile({ user }) {
  // No direct state access, just props
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {/* ... */}
    </div>
  );
}
```

## Performance Optimization

### Memoization

Use memoization to prevent unnecessary re-renders:

- **Selectors**: Memoize selectors to prevent recalculation
- **Component Memoization**: Use React.memo for pure functional components
- **Callback Memoization**: Use useCallback for event handlers

### State Granularity

Optimize state granularity:

- **State Splitting**: Split large state objects to prevent unnecessary re-renders
- **Normalized Data**: Keep entity data normalized for efficient updates
- **Selective Subscription**: Subscribe only to specific state slices

## Testing State Management

### Unit Testing

State management unit tests should cover:

- **Reducers**: Test state transitions for all action types
- **Selectors**: Verify correct data selection and transformation
- **Action Creators**: Test synchronous and asynchronous action creation

### Integration Testing

Integration tests should verify:

- **Component State Integration**: Test components with real state management
- **State Flow**: Verify complete flow from user action to state change to UI update
- **Async Operations**: Test complete async flows including loading states

## State Persistence

### Persistence Strategy

State persistence follows these guidelines:

- **Persisted State**: Only persist essential state (user preferences, authentication)
- **Storage Mechanism**: Use appropriate storage (localStorage, sessionStorage, cookies)
- **Rehydration**: Properly rehydrate state on application initialization
- **Migration**: Handle version changes in persisted state structure

## Common Pitfalls and Solutions

### State Duplication

Avoid duplicating state:
- Use selectors to derive calculated values
- Normalize entity data to prevent redundancy
- Store IDs or references instead of complete objects

### Overusing Global State

Keep state at appropriate levels:
- Use component state for UI-specific concerns
- Only elevate state when truly needed across components
- Consider context API for intermediate sharing

### Synchronization Issues

Prevent state synchronization problems:
- Implement optimistic updates carefully
- Use transactions for related state changes
- Consider using middleware for side effects

## References

- {{STATE_MGMT_REFERENCE_1}}
- {{STATE_MGMT_REFERENCE_2}}
- {{STATE_MGMT_REFERENCE_3}}