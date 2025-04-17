# State Management Patterns

This document outlines common patterns for managing application state in frontend applications.

## Core Principles

1. **Single Source of Truth**: Maintain a single, authoritative source for each piece of state.
2. **Immutable Updates**: Treat state as immutable and create new copies when making changes.
3. **Predictable State Changes**: State changes should be predictable and follow consistent patterns.
4. **Minimal State**: Only store what you need in global state; derive the rest.
5. **Separation of Concerns**: Separate state management logic from view logic.

## Local Component State

### React useState Hook

```jsx
import React, { useState } from 'react';

function Counter() {
  // Basic state
  const [count, setCount] = useState(0);
  
  // Object state
  const [user, setUser] = useState({
    name: '',
    email: '',
    isActive: false
  });
  
  // Update object state (immutably)
  const updateUserName = (name) => {
    setUser(prevUser => ({
      ...prevUser,
      name
    }));
  };
  
  // Array state
  const [items, setItems] = useState([]);
  
  // Add to array (immutably)
  const addItem = (item) => {
    setItems(prevItems => [...prevItems, item]);
  };
  
  // Remove from array (immutably)
  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Update item in array (immutably)
  const updateItem = (id, updates) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      <div>
        <input
          value={user.name}
          onChange={e => updateUserName(e.target.value)}
          placeholder="Name"
        />
        <p>Hello, {user.name || 'Guest'}</p>
      </div>
      
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addItem({ id: Date.now(), name: `Item ${items.length + 1}` })}>
        Add Item
      </button>
    </div>
  );
}
