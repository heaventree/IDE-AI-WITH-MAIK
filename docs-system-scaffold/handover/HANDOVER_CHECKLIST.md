# Handover Verification Checklist

## Purpose
This checklist ensures that handover documents meet the required standards for comprehensive knowledge transfer between agents. It's designed with the assumption that the next agent will have **total and complete ignorance** of what came before.

## Handover Document Quality Checklist

### 1. Completeness
- [ ] Contains a comprehensive project status summary
- [ ] Lists all completed tasks with specific details
- [ ] Includes all pending tasks with clear priorities
- [ ] Documents all known issues regardless of severity
- [ ] Provides explicit next steps with no ambiguity
- [ ] Includes key design decisions with rationale
- [ ] Lists all important file paths and resources

### 2. Clarity
- [ ] Uses precise, unambiguous language
- [ ] Avoids vague terms like "soon", "later", or "several"
- [ ] Specifies exact file paths rather than general locations
- [ ] Distinguishes clearly between completed work and planned work
- [ ] Uses consistent terminology throughout
- [ ] Avoids assumptions about next agent's knowledge
- [ ] Explains all acronyms and specialized terms

### 3. Accuracy
- [ ] All file paths have been verified to exist
- [ ] All documented features have been verified to work
- [ ] All issues and their status have been verified
- [ ] Status of documentation tasks matches Task Manager
- [ ] No conflicting or contradictory information
- [ ] All documented next steps are actionable
- [ ] No hallucinated files, features, or functionality

### 4. Context
- [ ] Explains why decisions were made, not just what decisions
- [ ] Provides background for challenges and resolutions
- [ ] Connects implementation details to project goals
- [ ] Explains relationships between components
- [ ] Provides historical context for current state
- [ ] Emphasizes critical paths and dependencies
- [ ] Notes areas of fragility or technical debt

### 5. Navigation
- [ ] Organizes information in a logical, findable structure
- [ ] Uses section headers and sub-headers effectively
- [ ] Includes a complete table of contents
- [ ] Provides cross-references between related topics
- [ ] Uses tables and lists for structured information
- [ ] Highlights critical information visually
- [ ] References supporting documentation clearly

## Verification Process

### Before Finalizing Handover
1. Complete the handover document using the HANDOVER_TEMPLATE.md
2. Verify against this checklist, checking off each item
3. Review the entire document for gaps or inconsistencies
4. Check that all links and file paths are correct and accessible
5. Ensure the document assumes no prior knowledge

### During Handover Review
1. Have you clearly separated facts from opinions/recommendations?
2. Have you verified all information personally rather than assuming?
3. Have you documented all "gotchas" and non-obvious behaviors?
4. Can someone follow your next steps without asking questions?
5. Have you eliminated all ambiguity from critical instructions?

## Final Verification Statement

I, {{AGENT_NAME}}, certify that this handover document:
- Provides complete context for the next agent with zero prior knowledge
- Contains only verified information with no hallucinations
- Includes explicit, unambiguous next steps
- Has been thoroughly checked against this checklist
- Is sufficient for seamless project continuation

Date: {{VERIFICATION_DATE}}

---

**Note**: This checklist should be included with your completed handover document to certify that you have verified all aspects of the handover quality.