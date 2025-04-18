# Bolt IDE Prompt UI Components

This package contains the UI components needed to implement the Prompt interface for the Bolt IDE. 

## Contents

- **components/** - React components for the interface
  - **layout/** - Layout components (Sidebar, MenuBar, StatusBar, IDELayout)
  - **prompt/** - Prompt-specific components (PromptPanel)
  - **ui/** - Base UI components 
- **contexts/** - React contexts needed for components
- **lib/** - Utility functions
- **styles/** - CSS styles for the components
- Configuration files (tailwind.config.ts, theme.json, postcss.config.js)

## Usage

1. Copy these files into your project maintaining the directory structure
2. Install the required dependencies from package.json
3. Import the components as needed

```tsx
import { PromptPanel } from "./components/prompt/PromptPanel";
import { IDELayout } from "./components/layout/IDELayout";
```

## Integrating the Prompt UI

The prompt interface can be added to an existing IDE by:

1. Using the IDELayout component which supports mode switching
2. Using the PromptPanel component directly within your own layout
3. Using the MenuBar and Sidebar components with mode switching capability

