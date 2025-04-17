/**
 * Workflow Domain Exceptions
 * 
 * Defines workflow-specific domain exceptions.
 */

const DomainException = require('./DomainException');

/**
 * Thrown when attempting to access a workflow that doesn't exist
 */
class WorkflowNotFoundException extends DomainException {
  /**
   * Create a new WorkflowNotFoundException
   * 
   * @param {string} workflowId - ID of the workflow that was not found
   */
  constructor(workflowId) {
    super(
      'DOM-2001',
      'Workflow not found',
      `Workflow with ID ${workflowId} does not exist`
    );
    this.workflowId = workflowId;
  }
}

/**
 * Thrown when attempting an operation on an incomplete workflow
 */
class WorkflowIncompleteException extends DomainException {
  /**
   * Create a new WorkflowIncompleteException
   * 
   * @param {string} documentId - ID of the document
   * @param {string} workflowId - ID of the incomplete workflow
   */
  constructor(documentId, workflowId) {
    super(
      'DOM-2002',
      'Workflow is incomplete',
      `Document ${documentId} has an incomplete workflow ${workflowId}`
    );
    this.documentId = documentId;
    this.workflowId = workflowId;
  }
}

/**
 * Thrown when attempting an invalid transition in a workflow
 */
class InvalidWorkflowTransitionException extends DomainException {
  /**
   * Create a new InvalidWorkflowTransitionException
   * 
   * @param {string} workflowId - ID of the workflow
   * @param {string} currentStatus - Current workflow status
   * @param {string} targetStatus - Target workflow status
   */
  constructor(workflowId, currentStatus, targetStatus) {
    super(
      'DOM-2003',
      'Invalid workflow transition',
      `Cannot transition workflow ${workflowId} from ${currentStatus} to ${targetStatus}`
    );
    this.workflowId = workflowId;
    this.currentStatus = currentStatus;
    this.targetStatus = targetStatus;
  }
}

/**
 * Thrown when a user doesn't have permission to perform a workflow action
 */
class WorkflowAccessDeniedException extends DomainException {
  /**
   * Create a new WorkflowAccessDeniedException
   * 
   * @param {string} workflowId - ID of the workflow
   * @param {string} userId - ID of the user who was denied access
   * @param {string} action - Action that was attempted
   */
  constructor(workflowId, userId, action) {
    super(
      'DOM-2004',
      'Workflow access denied',
      `User ${userId} does not have permission to ${action} workflow ${workflowId}`
    );
    this.workflowId = workflowId;
    this.userId = userId;
    this.action = action;
  }
}

/**
 * Thrown when a workflow step is invalid or not found
 */
class WorkflowStepInvalidException extends DomainException {
  /**
   * Create a new WorkflowStepInvalidException
   * 
   * @param {string} workflowId - ID of the workflow
   * @param {string} stepId - ID of the invalid step
   * @param {string} reason - Reason the step is invalid
   */
  constructor(workflowId, stepId, reason) {
    super(
      'DOM-2005',
      'Invalid workflow step',
      `Step ${stepId} in workflow ${workflowId} is invalid: ${reason}`
    );
    this.workflowId = workflowId;
    this.stepId = stepId;
    this.reason = reason;
  }
}

module.exports = {
  WorkflowNotFoundException,
  WorkflowIncompleteException,
  InvalidWorkflowTransitionException,
  WorkflowAccessDeniedException,
  WorkflowStepInvalidException
};