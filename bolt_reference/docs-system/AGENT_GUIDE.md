# AI Agent Guide for Documentation System

This guide provides comprehensive instructions for AI agents on how to use this documentation system to generate and maintain high-quality, consistent project documentation.

## Core Principles

As an AI agent, your primary role is to help create and maintain documentation that serves as a reliable source of truth. The following core principles should guide your work:

1. **Non-Destructive Development**: Never remove or modify existing, functional documentation outside the scope of your assigned task.
2. **Task-Focused Work**: Always reference the specific documentation requirements before beginning work.
3. **Context Awareness**: Understand the project structure and documentation organization before making changes.
4. **Consistency**: Maintain consistent terminology, formatting, and structure across all documents.
5. **Relevance**: Include only information relevant to the current project, avoiding generic content.
6. **Clarity**: Use clear, concise language suitable for the target audience.
7. **Maintainability**: Structure documents to be easily maintained and updated as the project evolves.

## Template System Overview

### Template Variables

Template variables are placeholders in the format `{{VARIABLE_NAME}}` that should be replaced with project-specific content. For example:

- `{{PROJECT_NAME}}` → "Customer Dashboard"
- `{{PROJECT_DESCRIPTION}}` → "A web application for customers to manage their accounts and view their order history."

These variables are defined in the `variables.json` file, which serves as a reference for all available variables.

### Templates Directory

The `/templates` directory contains standardized document templates for different aspects of project documentation:

- Project overview and objectives
- System architecture
- Technology stack
- Development workflows
- Coding standards
- Design systems
- Accessibility
- Testing strategies
- Security protocols
- Deployment processes
- AI integration
- WordPress integration
- Task management

### Snippets Directory

The `/snippets` directory contains reusable content for common documentation elements:

- Color systems
- Typography guidelines
- Component patterns
- Error handling guidelines
- API design patterns
- State management patterns

## Documentation Workflow for AI Agents

### 1. Assessment and Planning

- Identify the specific documentation needs of the project
- Determine which templates are required
- Understand project-specific requirements and constraints
- Create a documentation plan

### 2. Pre-Implementation Check

- Review existing project materials to gather relevant information
- Identify key stakeholders and their documentation needs
- Check for any existing documentation that should be integrated
- Clarify any ambiguous requirements

### 3. Implementation

- Copy the required templates to the project's documentation directory
- Replace all template variables with project-specific content
- Include relevant snippets from the `/snippets` directory
- Adapt content to match the project's specific needs
- Remove any sections that don't apply to the current project
- Add additional project-specific content as needed

### 4. Review and Verification

- Ensure all template variables have been replaced
- Verify consistency across all documents
- Check that all content is relevant to the specific project
- Ensure no placeholder or example content remains
- Verify that no duplication exists across documents
- Check that all links and references are valid
- Ensure all sections are properly formatted

### 5. Finalization

- Update the documentation version and change history
- Create a table of contents or index if multiple documents are involved
- Ensure documentation is easily accessible to all stakeholders

## Document Type-Specific Guidelines

### Project Overview

- Focus on business objectives and user needs
- Keep technical details minimal
- Include key stakeholders and milestones
- Highlight unique project aspects
- Define clear success criteria

### Architecture Documentation

- Use clear diagrams to illustrate component relationships
- Explain the system's high-level structure
- Describe data flow between components
- Document API integrations
- Include security considerations
- Explain scalability and performance characteristics

### Technical Documentation

- Be specific about technology versions and dependencies
- Include code examples to illustrate implementation patterns
- Document configuration requirements and environment setup
- Explain architectural decisions and their rationale
- Include troubleshooting information
- Address common technical questions

### Process Documentation

- Include step-by-step instructions with screenshots when helpful
- Define roles and responsibilities for each process
- Document approval workflows and decision points
- Include links to relevant tools and resources
- Define timeframes and deadlines if applicable
- Document any compliance or regulatory requirements

## Non-Destructive Documentation Updates

When updating existing documentation, adhere to these principles:

### 1. Scope Limitation

- Make changes only to documents specified in the requirements
- Focus modifications on specific sections or topics
- Do not restructure unrelated content, even if it seems inefficient

### 2. Additive Approach

- Prefer adding new information over modifying existing content
- When changes to existing content are necessary, make minimal, targeted modifications
- Never delete substantive content without explicit instructions

### 3. Preserve Structure

- Maintain the existing document structure unless explicitly instructed to change it
- Follow established formatting conventions
- Be especially careful with cross-references and links

### 4. Version Tracking

- Document all significant changes
- Include version information and change dates
- Note the nature of updates made

## Advanced Documentation Techniques

### 1. Documentation as Code

- Store documentation in version control alongside code
- Use Markdown or similar lightweight markup for compatibility
- Follow the same review process as code changes
- Implement automated checks for documentation quality

### 2. Audience-Focused Writing

- Identify the primary audience for each document
- Adjust technical depth based on the audience's expertise
- Include appropriate context for different roles
- Consider creating role-specific guides for complex systems

### 3. Progressive Disclosure

- Organize information from general to specific
- Present the most important information first, with details following
- Use expandable sections for detailed technical information
- Create multiple entry points for different knowledge levels

## Handling Documentation Gaps

If you identify gaps or inconsistencies in the documentation:

1. **Document the Gap**: Clearly note what information is missing or inconsistent
2. **Propose Solutions**: Suggest specific additions or revisions to address the gap
3. **Request Information**: Identify what additional information is needed from stakeholders
4. **Prioritize Fixes**: Suggest which gaps should be addressed first based on importance

## Best Practices

1. **Use Active Voice**: "The system validates user input" rather than "User input is validated by the system."
2. **Be Concise**: Avoid unnecessary words and repetition.
3. **Use Lists and Tables**: Structure information for easy scanning.
4. **Include Examples**: Provide examples to illustrate complex concepts.
5. **Link Related Documents**: Create cross-references between related documents.
6. **Update Documentation**: Keep documentation in sync with code changes.
7. **Version Documentation**: Include version information and change history.
8. **Use Visual Aids**: Include diagrams, flowcharts, and screenshots where helpful.
9. **Consider Internationalization**: Avoid idioms and culture-specific references.
10. **Test Documentation**: Verify that procedures can be followed as written.

## Common Pitfalls to Avoid

1. **Overspecification**: Don't document implementation details that are likely to change.
2. **Duplication**: Don't repeat information across multiple documents.
3. **Inconsistency**: Don't use different terms for the same concept.
4. **Ambiguity**: Don't use vague or unclear language.
5. **Outdated Content**: Don't leave outdated information in the documentation.
6. **Assuming Knowledge**: Don't assume readers have specific knowledge without providing context.
7. **Lack of Context**: Don't provide instructions without explaining the purpose.
8. **Information Overload**: Don't include excessive detail that obscures key points.

## Collaboration with Human Teams

When collaborating with human development teams:

1. **Status Updates**:
   - Provide clear summaries of documentation completed
   - Highlight any potential issues or inconsistencies found
   - Ask specific, targeted questions when needed

2. **Change Proposals**:
   - Present documentation changes with clear explanations of their purpose
   - Offer alternatives for complex decisions
   - Wait for approval before implementing major restructuring

3. **Knowledge Transfer**:
   - Document complex systems thoroughly
   - Explain the rationale behind documentation decisions
   - Highlight areas that may need future updates as the project evolves

## Continuous Improvement

AI agents should contribute to the continuous improvement of the documentation system by:

1. Suggesting updates to templates for clarity and completeness
2. Identifying patterns that could become new snippets
3. Recommending optimizations to the documentation structure
4. Helping maintain consistent style and quality across the system
5. Proposing new guidelines when recurring issues are identified

## AI Agent Self-Assessment Checklist

After generating or updating documentation, verify:

- [ ] All template variables have been replaced with appropriate content
- [ ] All content is relevant to the specific project (no generic filler)
- [ ] The documentation is consistent in terminology and style across all documents
- [ ] No placeholder or example content remains in the final documents
- [ ] No unnecessary duplication exists across documents
- [ ] All links and references are valid and point to the correct resources
- [ ] All sections are properly formatted according to the style guidelines
- [ ] Code examples (if any) are accurate, well-formatted, and follow project standards
- [ ] Diagrams and visual aids (if any) are clear and properly labeled
- [ ] The documentation addresses the needs of its intended audience
- [ ] Version information and change history are included
- [ ] The documentation aligns with the project's current state
