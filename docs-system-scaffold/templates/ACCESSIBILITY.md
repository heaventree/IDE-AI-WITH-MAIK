# {{PROJECT_NAME}} - Accessibility Guidelines

## Overview

{{ACCESSIBILITY_OVERVIEW}}

## Standards & Compliance

- **Target WCAG Level**: {{WCAG_LEVEL}} (e.g., WCAG 2.1 AA)
- **Specific Requirements**: {{SPECIFIC_REQUIREMENTS}}
- **Legal Considerations**: {{LEGAL_CONSIDERATIONS}}

## Key Principles

1. **Perceivable**
   - Information and user interface components must be presentable to users in ways they can perceive.
   
2. **Operable**
   - User interface components and navigation must be operable.
   
3. **Understandable**
   - Information and the operation of the user interface must be understandable.
   
4. **Robust**
   - Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Implementation Guidelines

### Semantic HTML

- Use proper heading hierarchy (h1-h6)
- Use semantic elements (`<nav>`, `<main>`, `<section>`, etc.)
- Use lists (`<ul>`, `<ol>`) for groups of related items
- Use tables for tabular data with proper headings

```html
<!-- Good Example -->
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <p>Content goes here.</p>
  </section>
</main>
