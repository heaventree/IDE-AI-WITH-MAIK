/**
 * Audit Logging Module for Documentation System
 * 
 * This module provides comprehensive audit logging functionality for tracking
 * all actions and changes within the documentation system.
 */

// Audit event types
const AUDIT_EVENTS = {
  USER: {
    LOGIN: 'user.login',
    LOGOUT: 'user.logout',
    PASSWORD_CHANGE: 'user.password_change',
    PROFILE_UPDATE: 'user.profile_update',
    ROLE_CHANGE: 'user.role_change',
    PERMISSION_CHANGE: 'user.permission_change',
    ACCOUNT_LOCKED: 'user.account_locked',
    ACCOUNT_UNLOCKED: 'user.account_unlocked',
    ACCOUNT_CREATED: 'user.account_created',
    ACCOUNT_DELETED: 'user.account_deleted',
    LOGIN_FAILED: 'user.login_failed'
  },
  DOCUMENT: {
    CREATED: 'document.created',
    VIEWED: 'document.viewed',
    UPDATED: 'document.updated',
    DELETED: 'document.deleted',
    RENAMED: 'document.renamed',
    MOVED: 'document.moved',
    PERMISSION_CHANGED: 'document.permission_changed',
    PUBLISHED: 'document.published',
    UNPUBLISHED: 'document.unpublished',
    ARCHIVED: 'document.archived',
    RESTORED: 'document.restored',
    EXPORTED: 'document.exported',
    IMPORTED: 'document.imported',
    COMMENTED: 'document.commented',
    COMMENT_DELETED: 'document.comment_deleted',
    VERSION_CREATED: 'document.version_created',
    VERSION_RESTORED: 'document.version_restored'
  },
  TEMPLATE: {
    CREATED: 'template.created',
    UPDATED: 'template.updated',
    DELETED: 'template.deleted',
    USED: 'template.used',
    PERMISSION_CHANGED: 'template.permission_changed'
  },
  WORKFLOW: {
    CREATED: 'workflow.created',
    UPDATED: 'workflow.updated',
    DELETED: 'workflow.deleted',
    STARTED: 'workflow.started',
    COMPLETED: 'workflow.completed',
    CANCELLED: 'workflow.cancelled',
    TASK_ASSIGNED: 'workflow.task_assigned',
    TASK_COMPLETED: 'workflow.task_completed',
    TASK_REASSIGNED: 'workflow.task_reassigned'
  },
  SYSTEM: {
    STARTED: 'system.started',
    STOPPED: 'system.stopped',
    CONFIG_CHANGED: 'system.config_changed',
    BACKUP_CREATED: 'system.backup_created',
    BACKUP_RESTORED: 'system.backup_restored',
    ERROR: 'system.error',
    ALERT: 'system.alert',
    MAINTENANCE_STARTED: 'system.maintenance_started',
    MAINTENANCE_COMPLETED: 'system.maintenance_completed',
    API_KEY_CREATED: 'system.api_key_created',
    API_KEY_DELETED: 'system.api_key_deleted',
    SETTING_CHANGED: 'system.setting_changed'
  },
  SECURITY: {
    PERMISSION_DENIED: 'security.permission_denied',
    SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
    API_KEY_MISUSED: 'security.api_key_misused',
    RATE_LIMIT_EXCEEDED: 'security.rate_limit_exceeded',
    BRUTE_FORCE_DETECTED: 'security.brute_force_detected',
    TOKEN_REVOKED: 'security.token_revoked'
  },
  AI: {
    MODEL_USED: 'ai.model_used',
    BIAS_DETECTED: 'ai.bias_detected',
    BIAS_REPORTED: 'ai.bias_reported',
    TRAINING_STARTED: 'ai.training_started',
    TRAINING_COMPLETED: 'ai.training_completed'
  }
};

// Severity levels
const SEVERITY = {
  DEBUG: 'debug',
  INFO: 'info',
  NOTICE: 'notice',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Audit Logger class for recording and querying audit events
 */
class AuditLogger {
  /**
   * Create a new AuditLogger instance
   * @param {Object} [options] - Configuration options
   * @param {Array} [options.storage] - Storage providers for audit logs
   * @param {boolean} [options.console] - Whether to log to console
   * @param {Array} [options.filter] - Event types to filter out
   * @param {Function} [options.errorHandler] - Error handling function
   * @param {boolean} [options.includeStackTrace] - Whether to include stack traces
   */
  constructor(options = {}) {
    this.storage = options.storage || [new MemoryStorage()];
    this.console = options.console !== false;
    this.filter = options.filter || [];
    this.errorHandler = options.errorHandler || console.error;
    this.includeStackTrace = options.includeStackTrace || false;
  }
  
  /**
   * Log an audit event
   * @param {string} eventType - Event type (from AUDIT_EVENTS)
   * @param {Object} data - Event data
   * @param {Object} [options] - Additional options
   * @param {string} [options.severity] - Event severity
   * @param {Object} [options.user] - User who performed the action
   * @param {string} [options.resource] - Resource affected
   * @param {string} [options.resourceType] - Type of resource affected
   * @param {string} [options.message] - Human-readable event message
   * @returns {string} Event ID
   */
  async log(eventType, data, options = {}) {
    // Skip filtered event types
    if (this.filter.includes(eventType)) {
      return null;
    }
    
    const timestamp = new Date().toISOString();
    const eventId = this._generateEventId();
    
    // Prepare user information
    const user = options.user ? {
      id: options.user.id,
      name: options.user.name || options.user.username || 'Unknown',
      roles: options.user.roles || []
    } : null;
    
    // Create event object
    const event = {
      id: eventId,
      timestamp,
      eventType,
      severity: options.severity || SEVERITY.INFO,
      user,
      resource: options.resource,
      resourceType: options.resourceType,
      message: options.message || `Event: ${eventType}`,
      data,
      metadata: {
        ip: data.ip,
        userAgent: data.userAgent,
        sessionId: data.sessionId
      }
    };
    
    // Add stack trace if enabled and not a debug/info event
    if (this.includeStackTrace && 
        ![SEVERITY.DEBUG, SEVERITY.INFO].includes(event.severity)) {
      event.stackTrace = this._getStackTrace();
    }
    
    // Clean the event (remove empty/undefined fields)
    this._cleanObject(event);
    
    // Log to console if enabled
    if (this.console) {
      this._logToConsole(event);
    }
    
    // Store the event in all configured storage providers
    try {
      const promises = this.storage.map(store => store.saveEvent(event));
      await Promise.all(promises);
    } catch (error) {
      this.errorHandler('Failed to save audit event', error);
    }
    
    return eventId;
  }
  
  /**
   * Log user activity
   * @param {string} action - User action (from AUDIT_EVENTS.USER)
   * @param {Object} user - User who performed the action
   * @param {Object} data - Additional data
   * @param {Object} [options] - Additional options
   * @returns {string} Event ID
   */
  async logUserActivity(action, user, data = {}, options = {}) {
    return this.log(action, data, {
      user,
      resource: user.id,
      resourceType: 'user',
      severity: options.severity || SEVERITY.INFO,
      message: options.message
    });
  }
  
  /**
   * Log document activity
   * @param {string} action - Document action (from AUDIT_EVENTS.DOCUMENT)
   * @param {string} documentId - Document identifier
   * @param {Object} user - User who performed the action
   * @param {Object} data - Additional data
   * @param {Object} [options] - Additional options
   * @returns {string} Event ID
   */
  async logDocumentActivity(action, documentId, user, data = {}, options = {}) {
    return this.log(action, data, {
      user,
      resource: documentId,
      resourceType: 'document',
      severity: options.severity || SEVERITY.INFO,
      message: options.message
    });
  }
  
  /**
   * Log security event
   * @param {string} action - Security action (from AUDIT_EVENTS.SECURITY)
   * @param {Object} data - Event data
   * @param {Object} [options] - Additional options
   * @returns {string} Event ID
   */
  async logSecurityEvent(action, data = {}, options = {}) {
    return this.log(action, data, {
      user: data.user,
      resource: data.resource,
      resourceType: data.resourceType,
      severity: options.severity || SEVERITY.WARNING,
      message: options.message
    });
  }
  
  /**
   * Log system event
   * @param {string} action - System action (from AUDIT_EVENTS.SYSTEM)
   * @param {Object} data - Event data
   * @param {Object} [options] - Additional options
   * @returns {string} Event ID
   */
  async logSystemEvent(action, data = {}, options = {}) {
    return this.log(action, data, {
      user: data.user,
      resource: data.resource,
      resourceType: data.resourceType || 'system',
      severity: options.severity || SEVERITY.INFO,
      message: options.message
    });
  }
  
  /**
   * Log error event
   * @param {Error} error - Error object
   * @param {Object} [context] - Additional context
   * @param {Object} [options] - Additional options
   * @returns {string} Event ID
   */
  async logError(error, context = {}, options = {}) {
    return this.log(AUDIT_EVENTS.SYSTEM.ERROR, {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      ...context
    }, {
      user: context.user,
      resource: context.resource,
      resourceType: context.resourceType,
      severity: options.severity || SEVERITY.ERROR,
      message: options.message || `Error: ${error.message}`
    });
  }
  
  /**
   * Query audit logs
   * @param {Object} [filters] - Filters to apply
   * @param {string} [filters.eventType] - Filter by event type
   * @param {string} [filters.severity] - Filter by severity
   * @param {string} [filters.resourceType] - Filter by resource type
   * @param {string} [filters.resource] - Filter by resource ID
   * @param {string} [filters.userId] - Filter by user ID
   * @param {Date|string} [filters.startDate] - Filter by start date
   * @param {Date|string} [filters.endDate] - Filter by end date
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Maximum events to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.sortField] - Field to sort by
   * @param {string} [options.sortOrder] - Sort order ('asc' or 'desc')
   * @returns {Array} Matching audit events
   */
  async query(filters = {}, options = {}) {
    // Default options
    const queryOptions = {
      limit: options.limit || 100,
      offset: options.offset || 0,
      sortField: options.sortField || 'timestamp',
      sortOrder: options.sortOrder || 'desc'
    };
    
    // Execute query on first storage provider
    try {
      return await this.storage[0].queryEvents(filters, queryOptions);
    } catch (error) {
      this.errorHandler('Failed to query audit events', error);
      return [];
    }
  }
  
  /**
   * Get audit events for a specific resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource identifier
   * @param {Object} [options] - Query options
   * @returns {Array} Resource audit events
   */
  async getResourceAudit(resourceType, resourceId, options = {}) {
    return this.query({
      resourceType,
      resource: resourceId
    }, options);
  }
  
  /**
   * Get audit events for a specific user
   * @param {string} userId - User identifier
   * @param {Object} [options] - Query options
   * @returns {Array} User audit events
   */
  async getUserAudit(userId, options = {}) {
    return this.query({
      userId
    }, options);
  }
  
  /**
   * Get security events
   * @param {Object} [filters] - Additional filters
   * @param {Object} [options] - Query options
   * @returns {Array} Security events
   */
  async getSecurityEvents(filters = {}, options = {}) {
    // Filter for events with 'security.' prefix
    const securityFilters = {
      ...filters,
      eventTypePrefix: 'security.'
    };
    
    return this.query(securityFilters, options);
  }
  
  /**
   * Get events for a date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {Object} [filters] - Additional filters
   * @param {Object} [options] - Query options
   * @returns {Array} Events in date range
   */
  async getEventsByDateRange(startDate, endDate, filters = {}, options = {}) {
    return this.query({
      ...filters,
      startDate,
      endDate
    }, options);
  }
  
  /**
   * Generate audit report
   * @param {Object} [filters] - Filters to apply
   * @param {string} [format='json'] - Report format ('json', 'csv', 'html')
   * @returns {string|Object} Formatted report
   */
  async generateReport(filters = {}, format = 'json') {
    // Get events
    const events = await this.query(filters, { limit: 1000 });
    
    // Generate report based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return this._formatReportCsv(events);
      case 'html':
        return this._formatReportHtml(events);
      case 'json':
      default:
        return this._formatReportJson(events);
    }
  }
  
  /**
   * Export audit logs
   * @param {Object} [filters] - Filters to apply
   * @param {string} [format='json'] - Export format ('json', 'csv')
   * @returns {string|Object} Exported data
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    // No limit for exports
    const events = await this.query(filters, { limit: 100000 });
    
    // Format data based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return this._formatReportCsv(events);
      case 'json':
      default:
        return {
          exportDate: new Date().toISOString(),
          eventCount: events.length,
          filters,
          events
        };
    }
  }
  
  /**
   * Generate a unique event ID
   * @returns {string} Unique ID
   * @private
   */
  _generateEventId() {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get current stack trace
   * @returns {string} Stack trace
   * @private
   */
  _getStackTrace() {
    const stackObj = {};
    Error.captureStackTrace(stackObj, this.log);
    return stackObj.stack;
  }
  
  /**
   * Clean an object by removing null/undefined fields
   * @param {Object} obj - Object to clean
   * @private
   */
  _cleanObject(obj) {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        this._cleanObject(obj[key]);
      }
    }
  }
  
  /**
   * Log an event to the console
   * @param {Object} event - Event to log
   * @private
   */
  _logToConsole(event) {
    const timestamp = new Date(event.timestamp).toLocaleString();
    const userId = event.user ? event.user.id : 'system';
    const message = `[${timestamp}] [${event.severity.toUpperCase()}] [${event.eventType}] ${event.message} (User: ${userId})`;
    
    switch (event.severity) {
      case SEVERITY.DEBUG:
        console.debug(message);
        break;
      case SEVERITY.INFO:
      case SEVERITY.NOTICE:
        console.info(message);
        break;
      case SEVERITY.WARNING:
        console.warn(message);
        break;
      case SEVERITY.ERROR:
      case SEVERITY.CRITICAL:
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }
  
  /**
   * Format report as JSON
   * @param {Array} events - Audit events
   * @returns {Object} JSON report
   * @private
   */
  _formatReportJson(events) {
    return {
      generatedAt: new Date().toISOString(),
      eventCount: events.length,
      events
    };
  }
  
  /**
   * Format report as CSV
   * @param {Array} events - Audit events
   * @returns {string} CSV report
   * @private
   */
  _formatReportCsv(events) {
    // CSV headers
    const headers = ['Timestamp', 'Event Type', 'Severity', 'User ID', 'Resource', 'Resource Type', 'Message'];
    
    // Format rows
    const rows = events.map(event => [
      event.timestamp,
      event.eventType,
      event.severity,
      event.user ? event.user.id : '',
      event.resource || '',
      event.resourceType || '',
      event.message
    ]);
    
    // Combine headers and rows
    const allRows = [headers, ...rows];
    
    // Convert to CSV
    return allRows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')).join('\n');
  }
  
  /**
   * Format report as HTML
   * @param {Array} events - Audit events
   * @returns {string} HTML report
   * @private
   */
  _formatReportHtml(events) {
    // HTML header
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Audit Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .info { color: #0c5460; background-color: #d1ecf1; }
    .warning { color: #856404; background-color: #fff3cd; }
    .error { color: #721c24; background-color: #f8d7da; }
    .critical { color: #ffffff; background-color: #dc3545; }
  </style>
</head>
<body>
  <h1>Audit Report</h1>
  <p>Generated at: ${new Date().toLocaleString()}</p>
  <p>Total events: ${events.length}</p>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>Event Type</th>
        <th>Severity</th>
        <th>User</th>
        <th>Resource</th>
        <th>Message</th>
      </tr>
    </thead>
    <tbody>`;
    
    // Add event rows
    const rows = events.map(event => {
      const timestamp = new Date(event.timestamp).toLocaleString();
      const userName = event.user ? (event.user.name || event.user.id) : 'System';
      
      return `
      <tr class="${event.severity}">
        <td>${timestamp}</td>
        <td>${event.eventType}</td>
        <td>${event.severity.toUpperCase()}</td>
        <td>${userName}</td>
        <td>${event.resourceType ? `${event.resourceType}: ${event.resource || ''}` : ''}</td>
        <td>${event.message}</td>
      </tr>`;
    }).join('');
    
    // HTML footer
    return html + rows + `
    </tbody>
  </table>
</body>
</html>`;
  }
}

/**
 * Memory-based storage for audit events
 */
class MemoryStorage {
  constructor() {
    this.events = [];
  }
  
  /**
   * Save an audit event
   * @param {Object} event - Event to save
   * @returns {Promise<Object>} Saved event
   */
  async saveEvent(event) {
    this.events.push(event);
    return event;
  }
  
  /**
   * Query events with filters
   * @param {Object} filters - Filters to apply
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Matching events
   */
  async queryEvents(filters, options) {
    let results = [...this.events];
    
    // Apply filters
    if (filters.eventType) {
      results = results.filter(e => e.eventType === filters.eventType);
    }
    
    if (filters.eventTypePrefix) {
      results = results.filter(e => e.eventType.startsWith(filters.eventTypePrefix));
    }
    
    if (filters.severity) {
      results = results.filter(e => e.severity === filters.severity);
    }
    
    if (filters.resourceType) {
      results = results.filter(e => e.resourceType === filters.resourceType);
    }
    
    if (filters.resource) {
      results = results.filter(e => e.resource === filters.resource);
    }
    
    if (filters.userId) {
      results = results.filter(e => e.user && e.user.id === filters.userId);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate).toISOString();
      results = results.filter(e => e.timestamp >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate).toISOString();
      results = results.filter(e => e.timestamp <= endDate);
    }
    
    // Sort results
    const sortField = options.sortField || 'timestamp';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    
    results.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || results.length;
    
    return results.slice(offset, offset + limit);
  }
}

module.exports = {
  AuditLogger,
  MemoryStorage,
  AUDIT_EVENTS,
  SEVERITY
};