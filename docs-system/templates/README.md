# Documentation Templates

This directory contains standardized templates for various types of documentation. These templates provide a consistent structure and format for all documentation in the system.

## Using Templates

When creating new documentation, start with the appropriate template from this directory. Each template includes:

1. Standard sections that should be included in that document type
2. Placeholder comments indicating what content should be added
3. Formatting guidelines specific to the document type

## Placeholder Syntax

Templates use a standardized placeholder syntax to indicate where content should be added:

For Markdown files:
```markdown
<!-- AGENT_PLACEHOLDER: brief description of what needs to be filled -->
```

For JavaScript or other code files:
```javascript
// [AGENT_FILL: brief description of what needs to be filled]
```

## Available Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| [technical_spec.md](./technical_spec.md) | Technical specification template | Documenting system components, APIs, and implementation details |
| [project_overview.md](./project_overview.md) | Project overview template | High-level project description and goals |
| [user_guide.md](./user_guide.md) | User guide template | End-user instructions and workflows |

<!-- AGENT_PLACEHOLDER: Add more templates as they become available -->

## Template Structure

Each template follows a consistent pattern:

1. **Header**: Document title and basic metadata
2. **Overview**: Brief introduction to the document purpose
3. **Main Content**: Specific sections for the document type
4. **Supporting Information**: Additional context, references, etc.

## Customizing Templates

When using a template:

1. Keep the overall structure intact
2. Replace all placeholder text with actual content
3. Remove sections that aren't relevant (but document why they were removed)
4. Add sections if needed for your specific context

## Template Quality Assurance

Before considering a document complete:

1. Ensure all placeholders have been replaced with actual content
2. Verify that all required sections are filled in
3. Check for consistency with related documentation
4. Review for technical accuracy and completeness

---

*This README serves as a guide for using the documentation templates. For more information about documentation standards, refer to the [Documentation Guidelines](/docs/documentation_guidelines.md).*