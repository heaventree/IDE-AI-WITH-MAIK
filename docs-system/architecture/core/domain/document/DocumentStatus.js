/**
 * Document Status Enum
 * 
 * Represents the possible statuses of a document in the system.
 */

const DocumentStatus = {
  /**
   * Document is a draft and can be edited
   */
  DRAFT: 'DRAFT',
  
  /**
   * Document is under review
   */
  REVIEW: 'REVIEW',
  
  /**
   * Document has been approved but not published
   */
  APPROVED: 'APPROVED',
  
  /**
   * Document is published and cannot be edited
   */
  PUBLISHED: 'PUBLISHED',
  
  /**
   * Document is archived
   */
  ARCHIVED: 'ARCHIVED',
  
  /**
   * Document is rejected
   */
  REJECTED: 'REJECTED',
  
  /**
   * Check if a status is valid
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if the status is valid
   */
  isValid(status) {
    return [
      this.DRAFT,
      this.REVIEW,
      this.APPROVED,
      this.PUBLISHED,
      this.ARCHIVED,
      this.REJECTED
    ].includes(status);
  },
  
  /**
   * Get all valid statuses
   * 
   * @returns {Array<string>} Array of valid statuses
   */
  getAll() {
    return [
      this.DRAFT,
      this.REVIEW,
      this.APPROVED,
      this.PUBLISHED,
      this.ARCHIVED,
      this.REJECTED
    ];
  },
  
  /**
   * Check if a document can be edited in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be edited in this status
   */
  canEdit(status) {
    return [
      this.DRAFT,
      this.REVIEW,
      this.REJECTED
    ].includes(status);
  },
  
  /**
   * Check if a document can be published in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be published in this status
   */
  canPublish(status) {
    return [
      this.APPROVED
    ].includes(status);
  },
  
  /**
   * Check if a document can be reviewed in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be reviewed in this status
   */
  canReview(status) {
    return [
      this.DRAFT
    ].includes(status);
  },
  
  /**
   * Check if a document can be approved in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be approved in this status
   */
  canApprove(status) {
    return [
      this.REVIEW
    ].includes(status);
  },
  
  /**
   * Check if a document can be rejected in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be rejected in this status
   */
  canReject(status) {
    return [
      this.REVIEW
    ].includes(status);
  },
  
  /**
   * Check if a document can be archived in a given status
   * 
   * @param {string} status - Status to check
   * @returns {boolean} True if a document can be archived in this status
   */
  canArchive(status) {
    return [
      this.PUBLISHED
    ].includes(status);
  }
};

module.exports = DocumentStatus;