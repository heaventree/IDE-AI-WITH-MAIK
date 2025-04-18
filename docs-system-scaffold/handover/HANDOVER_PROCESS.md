# Documentation System Handover Process

## Core Principles

1. **Zero Ambiguity**: Every agent must know exactly what to do at each step
2. **Documentation First**: All work must be documented before implementing
3. **Methodical Progression**: Complete one module before moving to the next
4. **Continuous Reflection**: Always refer back to guides and documentation
5. **Avoid Hallucinations**: Use factual information only, no fabrication
6. **Quality Handover**: Create comprehensive handover documents

---

## First-Time Agent Process

### Step 1: System Initialization
1. Read the AGENT_ONBOARDING_GUIDE.md
2. Navigate to the Task Manager system
3. Review the complete Project Design Brief
4. Select your agent role based on your assigned task

### Step 2: Documentation Tasks
1. Complete ALL documentation tasks in the order presented by the Task Manager
2. For each task:
   - Create required files in the EXACT specified locations
   - Fill ALL placeholders with factual project information
   - Validate completion with the Task Manager
   - ONLY proceed when current task is marked complete

### Step 3: Implementation (only after documentation is complete)
1. Implement each feature ONLY after its documentation is complete
2. Follow a modular approach - complete one component before starting another
3. After each module is completed:
   - Update the documentation with any changes
   - Validate functionality
   - Document any deviations from the original plan

### Step 4: End-of-Shift Handover Creation
1. Complete the HANDOVER_TEMPLATE.md in the handover directory
2. Include:
   - Detailed summary of completed work
   - Current system state
   - Remaining tasks with clear next steps
   - Known issues and challenges
   - Recommendations for the next agent
3. Validate handover document against the Handover Checklist
4. Ensure your handover is accessible through the Task Manager system

---

## Subsequent Agent Process

### Step A: Orientation
1. Read the AGENT_ONBOARDING_GUIDE.md (do NOT skip this step)
2. Navigate to the Task Manager system
3. Review the complete Project Design Brief
4. Read the most recent handover document
5. Select your agent role based on your assigned task

### Step B: Task Continuation
1. Identify the exact next steps from the previous handover
2. Refer to the Task Manager for current incomplete tasks
3. Verify understanding by checking the project state matches the handover description
4. If any discrepancy is found, document it before proceeding

### Step C: Implementation
1. Continue work ONLY on the specific tasks identified
2. Follow the same modular approach as the first agent
3. After each module:
   - Update documentation
   - Validate functionality
   - Reflect on progress against the project design brief

### Step D: Next Handover Creation
1. Complete the HANDOVER_TEMPLATE.md in the handover directory
2. Ensure even greater detail than the previous handover
3. Include ALL information from Step 4 of the First-Time Agent Process
4. Reference previous handovers to maintain continuity
5. Validate against the Handover Checklist

---

## Handover Quality Requirements

All handover documents MUST:

1. Be complete enough for an agent with ZERO prior knowledge to continue
2. Include EXACT file paths for all referenced files
3. Provide CLEAR, unambiguous next steps with no room for interpretation
4. Document ALL known issues, even minor ones
5. Reference ALL relevant design decisions and their rationale
6. Include progress status of ALL documentation tasks
7. Link to ALL related documentation files

## Avoiding Hallucinations

To prevent hallucinations:

1. ONLY document what actually exists in the system
2. If unsure about something, CHECK first, then document
3. Clearly distinguish between implemented features and planned features
4. Use factual, verifiable information only
5. Include file paths for all referenced components
6. When documenting APIs or interfaces, validate them first
7. Include version numbers and timestamps for all components

---

## Process Verification

Before considering any phase complete, verify:

1. All files are in their designated locations
2. All documentation is complete and accurate
3. All placeholders have been replaced
4. The Task Manager shows the task as complete
5. Any implemented functionality works as documented
6. The handover document passes the quality checklist

**Remember: The next agent will have TOTAL AND COMPLETE IGNORANCE of what came before them. Your handover is their only guide.**