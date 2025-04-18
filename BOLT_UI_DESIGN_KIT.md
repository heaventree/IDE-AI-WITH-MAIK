# Bolt UI Design Kit & Implementation Guide

This document serves as a comprehensive guide to the Bolt UI Design Kit, detailing all its components, design principles, and implementation methods. This guide is specifically written to help you apply our new UI styling to an existing Bolt installation.

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color Palette & Theme Variables](#color-palette--theme-variables)
3. [Typography System](#typography-system)
4. [Component Library](#component-library)
5. [CSS Architecture](#css-architecture)
6. [Implementation Guide](#implementation-guide)
7. [Migration Path](#migration-path)
8. [Theming & Customization](#theming--customization)

---

## Design System Overview

The Bolt UI Design Kit is built on a modern, component-based architecture utilizing Tailwind CSS and shadcn/ui. It's designed to provide a consistent, accessible, and visually appealing interface for the Bolt DIY application while ensuring ease of implementation and customization.

### Key Features

- **Single Source of Styling**: All styling definitions come from a centralized `theme.json` file.
- **CSS Variables**: Component styles use CSS variables derived from the theme to maintain consistency.
- **Utility-First Approach**: Leverages Tailwind CSS for rapid development and styling.
- **Component Primitives**: Based on shadcn/ui, which uses Radix UI under the hood for accessibility.
- **Dark Mode Support**: Built-in support for light and dark modes.
- **Responsive Design**: All components are designed to work across device sizes.

### Design Principles

1. **Consistency**: Uniform appearance across all components and screens.
2. **Clarity**: Clear visual hierarchy and intuitive interfaces.
3. **Efficiency**: Streamlined workflows and minimal cognitive load.
4. **Accessibility**: WCAG-compliant design with keyboard navigation support.
5. **Flexibility**: Easily customizable to adapt to different use cases.

---

## Color Palette & Theme Variables

The color system is based on HSL values stored in CSS variables, making it easy to adjust and maintain. All colors are defined in the central `theme.json` file:

```json
{
  "variant": "professional",
  "primary": "#7b68ee",
  "secondary": "#8e77ff",
  "accent": "#00dfb5",
  "highlight": "#c678dd",
  "background": "#0f1127",
  "foreground": "#e2e4f3",
  "appearance": "dark",
  "radius": 0.5
}
```

### Core Color Tokens

These color tokens are transformed into a comprehensive set of CSS variables:

| Token | Purpose | CSS Variable |
|-------|---------|--------------|
| primary | Main brand color | `--primary` |
| primary-foreground | Text on primary color | `--primary-foreground` |
| secondary | Secondary brand color | `--secondary` |
| accent | Accent highlights | `--accent` |
| background | Page background | `--background` |
| foreground | Default text color | `--foreground` |
| muted | Subtle backgrounds | `--muted` |
| muted-foreground | Subtle text | `--muted-foreground` |
| border | Border colors | `--border` |
| input | Form input background | `--input` |
| ring | Focus rings | `--ring` |
| card | Card backgrounds | `--card` |
| card-foreground | Text on cards | `--card-foreground` |
| destructive | Error states | `--destructive` |
| destructive-foreground | Text on errors | `--destructive-foreground` |
| success | Success states | `--success` |
| warning | Warning states | `--warning` |
| info | Information states | `--info` |

### Semantic Color Variables

These variables are used for specific UI contexts:

```
--sidebar-background: hsl(222, 47%, 11%);
--sidebar-foreground: hsl(214, 32%, 91%);
--sidebar-border: hsl(215, 25%, 27%);
--sidebar-primary: hsl(222, 47%, 11%);
--sidebar-primary-foreground: hsl(214, 32%, 91%);
--sidebar-accent: hsl(217, 33%, 17%);
--sidebar-accent-foreground: hsl(214, 32%, 91%);
--sidebar-ring: hsl(215, 20%, 65%);
```

---

## Typography System

The typography system uses a modular scale with consistent spacing and sizing:

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
--font-heading: var(--font-sans);
```

### Font Sizes

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Text Variants

These are pre-defined text styles for common use cases:

- **heading**: Page headings and major section titles
- **title**: Component headers and card titles
- **subtitle**: Secondary headings
- **label**: Form labels and small headings
- **caption**: Small supporting text
- **code**: Inline and block code snippets
- **gradient**: Special gradient text for emphasis

---

## Component Library

The Bolt UI Design Kit includes a comprehensive set of components built with shadcn/ui. Here are the key components and their usage:

### Basic Components

#### Button

```tsx
<Button variant="default">Default Button</Button>
<Button variant="primary">Primary Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
```

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text goes here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      Dialog content goes here
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

### Form Components

#### Input

```tsx
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Enter email..." />
<Input type="password" placeholder="Enter password..." />
```

#### Select

```tsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox

```tsx
<div className="items-top flex space-x-2">
  <Checkbox id="terms" />
  <div className="grid gap-1.5 leading-none">
    <label
      htmlFor="terms"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      Accept terms and conditions
    </label>
  </div>
</div>
```

### Layout Components

#### Tabs

```tsx
<Tabs defaultValue="tab1" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Tab 1 content</TabsContent>
  <TabsContent value="tab2">Tab 2 content</TabsContent>
</Tabs>
```

#### Accordion

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Content for section 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Content for section 2
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## CSS Architecture

The CSS architecture is designed around a utility-first approach using Tailwind CSS, with component-specific styles using CSS variables.

### Global Styles

Global styles are defined in `client/src/index.css` and include:

1. Base CSS variable definitions
2. Dark mode overrides
3. Global element styles
4. Utility class definitions

### Component Styles

Components use a combination of:

1. Tailwind utility classes for layout and basic styling
2. CSS variables for theming
3. Component-specific styles for complex interactions
4. The `cn()` utility function for conditional class composition

### Utility Functions

Several utility functions help maintain consistent styling:

- `cn()`: Class name composition utility
- `tw()`: Helper for consistent Tailwind class strings
- `sx()`: Helper for consistent Theme UI styling
- `tokenToVariable()`: Converts design tokens to CSS variable syntax
- `updateThemeJson()`: Updates theme.json with new design tokens

---

## Implementation Guide

Follow these steps to apply the Bolt UI Design Kit to an existing Bolt installation:

### Step 1: Install Required Dependencies

```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip class-variance-authority clsx tailwind-merge
```

### Step 2: Copy Core Design System Files

1. Copy the following files from the Bolt UI Design Kit to your project:

   - `theme.json` → root directory
   - `tailwind.config.ts` → root directory
   - `postcss.config.js` → root directory
   - `client/src/lib/utils.ts` → to your utils directory
   - `client/src/lib/designSystem.ts` → to your lib directory
   - `client/src/components/ui/*` → to your components directory

2. Update your imports to reflect your project structure

### Step 3: Configure Tailwind CSS

Make sure your `tailwind.config.ts` includes the proper configuration:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

### Step 4: Set Up Global CSS

Create or update your global CSS file (typically `index.css` or `global.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 214 32% 91%;
    
    --card: 222 47% 11%;
    --card-foreground: 214 32% 91%;
    
    --popover: 222 47% 11%;
    --popover-foreground: 214 32% 91%;
    
    --primary: 255 92% 76%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 215 25% 27%;
    --input: 217 33% 17%;
    --ring: 255 92% 76%;
    
    --radius: 0.5rem;
  }
 
  .light {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    
    --primary: 255 92% 76%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222 47% 11%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215 16% 47%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222 47% 11%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 255 92% 76%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### Step 5: Create a Theme Provider

Set up a theme provider to manage your theme settings:

```tsx
// ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
```

### Step 6: Update Your App Entry Point

Apply the ThemeProvider to your application:

```tsx
// App.tsx or _app.tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### Step 7: Replace Existing UI Components

Gradually replace existing components with their shadcn/ui equivalents. For example:

Before:
```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Submit
</button>
```

After:
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary">Submit</Button>
```

---

## Migration Path

To make a smooth transition from an existing Bolt UI to the new Design Kit, follow this migration path:

### Phase 1: Foundation

1. **Install dependencies** and set up the Tailwind configuration
2. **Add the theme.json file** and CSS variables
3. **Create utility components** like Button, Card, and Dialog
4. **Establish the theme provider** for dark/light mode support

### Phase 2: Core Components

1. **Replace basic UI elements** with Design Kit components
2. **Update layout containers** to use the new styling approach
3. **Refactor navigation components** to use the new Dropdown and Menu components
4. **Update form components** to use the new Input, Select, and Checkbox components

### Phase 3: Application-Specific Components

1. **Refactor complex components** specific to your application
2. **Update specialized layouts** like dashboards or data views
3. **Fine-tune component customizations** for your specific use cases
4. **Test thoroughly** across different screen sizes and themes

---

## Theming & Customization

The Bolt UI Design Kit is designed to be easily customizable through the `theme.json` file.

### Customizing Colors

To change the color scheme, update the color values in `theme.json`:

```json
{
  "variant": "professional",
  "primary": "#3b82f6", // Change to your preferred primary color
  "secondary": "#5096ff",
  "accent": "#22d3ee",
  "highlight": "#a855f7",
  "background": "#0f172a",
  "foreground": "#e2e8f0",
  "appearance": "dark", 
  "radius": 0.5
}
```

### Customizing Component Styles

To customize specific components, you can:

1. **Use the variant prop** for pre-defined variants
2. **Apply className** to override specific styles with Tailwind
3. **Create new variants** in your Tailwind theme configuration
4. **Extend component styles** with custom CSS or styled-components

Example of customizing a Button:

```tsx
// Default button
<Button>Default</Button>

// Custom styling with className
<Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
  Gradient Button
</Button>

// Creating a new button variant in tailwind.config.ts
// In your config:
theme: {
  extend: {
    // ...
    components: {
      button: {
        glass: "bg-opacity-20 backdrop-blur-lg border border-white/10",
      }
    }
  }
}

// Then in your component:
<Button className="glass">Glass Button</Button>
```

---

By following this guide, you should be able to successfully implement the Bolt UI Design Kit into an existing Bolt installation, providing a consistent, modern, and highly customizable user interface.