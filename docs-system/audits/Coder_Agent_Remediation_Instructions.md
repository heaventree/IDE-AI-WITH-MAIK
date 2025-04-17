# Coder Agent Remediation Instructions

These instructions provide guidance for AI coding agents involved in the remediation process following an audit. Follow these instructions precisely to ensure consistent, high-quality remediation.

## General Protocol

1. **Scope Adherence**
   - Limit work strictly to the issues identified in the audit
   - Do not introduce new features or architectural changes unless specifically requested
   - Focus on remediation, not enhancement

2. **Documentation First**
   - Document your understanding of each issue before attempting fixes
   - Detail your planned approach for each remediation item
   - Note any potential side effects of proposed changes

3. **Systematic Approach**
   - Address issues in the priority order specified in the remediation strategy
   - Tackle related issues together to avoid redundant work
   - Follow the phases outlined in the remediation strategy document

## Task Workflow

For each issue:

1. **Analysis**
   - Review the audit finding thoroughly
   - Identify root cause(s)
   - Determine related components and potential impact

2. **Planning**
   - Document the remediation approach
   - List files to be modified
   - Estimate complexity and potential risks

3. **Implementation**
   - Make the smallest possible change to resolve the issue
   - Follow coding standards and patterns established in the project
   - Add or update tests to cover the remediated functionality

4. **Verification**
   - Verify the issue is resolved through appropriate testing
   - Ensure no regressions are introduced
   - Document the verification process and results

5. **Documentation**
   - Update relevant documentation
   - Add comments for complex logic
   - Document any architectural or process changes

## Communication Requirements

For each completed remediation item:

1. **Issue Summary**
   - Brief description of the issue
   - Root cause analysis
   - Remediation approach

2. **Changes Made**
   - List of files modified
   - Description of changes
   - Any configuration or environment changes

3. **Verification Results**
   - Tests performed
   - Evidence of resolution
   - Any remaining edge cases or limitations

4. **Documentation Updates**
   - Changes to documentation
   - New documentation created
   - Process or architectural updates

## Change Management

1. **Version Control**
   - Create a descriptive branch for each issue or related set of issues
   - Make atomic, focused commits with clear messages
   - Reference the audit issue ID in commit messages

2. **Change Logging**
   - Update `CHANGELOG.md` with each resolved issue
   - Follow the established format for changelog entries
   - Categorize changes appropriately (fix, security, compliance, etc.)

3. **Version Bumping**
   - Update version numbers according to Semantic Versioning
   - Document version changes in `VERSION.md`
   - Note breaking changes explicitly

## Progress Tracking

1. **Status Reporting**
   - Update the remediation strategy document with progress
   - Mark completed items in the appropriate checklist
   - Document any blockers or dependencies

2. **Time Tracking**
   - Record time spent on each remediation item
   - Note any items taking significantly longer than estimated
   - Identify opportunities for efficiency in related items

## Final Verification

Before completing remediation:

1. **Comprehensive Testing**
   - Run the full test suite
   - Perform manual verification of fixed issues
   - Verify no regressions in related functionality

2. **Documentation Review**
   - Ensure all documentation is updated
   - Verify changelog entries for completeness
   - Check for consistency across documentation

3. **Audit Criteria Verification**
   - Re-evaluate against the original audit criteria
   - Ensure all remediations meet or exceed requirements
   - Document evidence of compliance

## Handover Protocol

When completing remediation:

1. **Remediation Summary**
   - Comprehensive list of issues addressed
   - Summary of approach and changes
   - Outstanding items or known limitations

2. **Verification Evidence**
   - Test results and logs
   - Before/after comparisons where applicable
   - Performance metrics if relevant

3. **Next Steps**
   - Recommendations for future improvements
   - Ongoing maintenance requirements
   - Monitoring suggestions

---

**These instructions must be followed precisely to ensure consistent, high-quality remediation that aligns with project standards and audit requirements.**