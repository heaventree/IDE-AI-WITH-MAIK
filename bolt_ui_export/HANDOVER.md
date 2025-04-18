# Bolt UI Prompt Integration - Handover Document

## Project Overview
This project involved enhancing the Bolt IDE with a prompt-based interface that allows users to toggle seamlessly between code editing and AI prompting modes. The implementation maintains the existing IDE layout while introducing a clean, consistent prompt experience.

## Session Updates

### Session 1: Initial Implementation
- Created an EntryPage component with a light theme following the Bolt UI Design Kit
- Implemented basic layout and navigation capabilities
- Explored design approaches for integrating prompt functionality

### Session 2: Integration with IDE
- Shifted design approach from a separate entry page to an integrated prompt panel
- Developed the PromptPanel component to replace editor content when in prompt mode
- Updated IDE layout components to support mode switching
- Added toggle buttons in both menubar and sidebar

### Session 3: UI Enhancement & Refinement
- Redesigned the PromptPanel with a more polished look matching the design system
- Modified layout to be context-aware (switching between editor and prompt modes)
- Implemented hiding of coding-specific tools when in prompt mode
- Made file explorer disappear in prompt mode to reduce confusion
- Standardized dark theme throughout for visual consistency

## Architecture Overview

### Core Components
1. **IDELayout.tsx** - Main container with state management for mode switching
2. **MenuBar.tsx** - Context-aware top bar with different options based on mode
3. **Sidebar.tsx** - Side navigation that changes available tools based on mode
4. **StatusBar.tsx** - Shows current status and mode
5. **PromptPanel.tsx** - Main prompt interface with form, templates, and recent apps

### Mode Switching Implementation
The system uses a mode state ('editor' | 'prompt') in the IDELayout component. This state:
- Controls which content is displayed in the main area
- Determines which tools are shown in the sidebar
- Adjusts menu options in the MenuBar
- Updates the StatusBar to reflect the current mode

### Design Decisions
1. **Maintaining IDE Structure**: Rather than creating a separate page, we integrated the prompt panel within the existing IDE layout to provide a seamless experience.
2. **Context-Aware UI**: UI elements adapt based on the current mode, showing only relevant tools and options.
3. **Consistent Styling**: Dark theme throughout with matching component styles to maintain visual consistency.
4. **Clean Prompt UI**: Prompt interface follows modern design principles with card-based recent items and minimal, focused input area.

## Testing Notes
- Mode switching works via both MenuBar and Sidebar toggle buttons
- File explorer disappears in prompt mode to reduce visual noise
- Status bar shows the current mode for clear user feedback
- Dark theme maintained consistently throughout all UI components

## Future Enhancements
- Add keyboard shortcuts for mode switching (e.g., Alt+P for prompt mode)
- Implement actual prompt processing and response rendering
- Add animation for smoother transitions between modes
- Consider adding a mini-preview of the editor in prompt mode for context

## Integration Guide
To integrate these components into another project:
1. Copy the component files maintaining the directory structure
2. Install required dependencies (React, Tailwind CSS, shadcn/ui, etc.)
3. Import and use the IDELayout component with mode switching capability
4. Alternatively, use the PromptPanel component directly within your own layout

## Dependencies
The implementation relies on:
- React 18+
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
