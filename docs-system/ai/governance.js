/**
 * AI Governance Module for Documentation System
 * 
 * This module provides governance, ethics, and bias mitigation functionality
 * for AI systems used within the documentation platform.
 */

/**
 * AI Governance class for managing AI ethics, transparency, and fairness
 */
class AIGovernance {
  /**
   * Create a new AIGovernance instance
   * @param {Object} [options] - Configuration options
   * @param {Object} [options.modelMetadata] - Metadata about AI models
   * @param {Function} [options.logger] - Logging function
   * @param {Array} [options.sensitiveTerms] - Terms considered sensitive for bias detection
   */
  constructor(options = {}) {
    this.modelMetadata = options.modelMetadata || {};
    this.logger = options.logger || console;
    this.sensitiveTerms = options.sensitiveTerms || [];
    this.decisions = [];
    this.biasReports = [];
    this.auditLog = [];
  }
  
  /**
   * Register an AI model with its metadata
   * @param {string} modelId - Unique identifier for the model
   * @param {Object} metadata - Model metadata
   * @param {string} metadata.name - Human-readable name
   * @param {string} metadata.version - Model version
   * @param {string} metadata.provider - Model provider/creator
   * @param {string} metadata.type - Model type (e.g., 'text-generation', 'classification')
   * @param {string} metadata.description - Description of the model
   * @param {Array} metadata.trainingDatasets - Datasets used for training
   * @param {Object} metadata.limitations - Known limitations of the model
   * @param {Object} metadata.biases - Known biases in the model
   * @param {Array} metadata.useCases - Approved use cases
   * @param {Array} metadata.ethicalGuidelines - Ethical guidelines for usage
   */
  registerModel(modelId, metadata) {
    if (!modelId) {
      throw new Error('Model ID is required');
    }
    
    const requiredFields = ['name', 'version', 'provider', 'type'];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        throw new Error(`Required metadata field missing: ${field}`);
      }
    }
    
    this.modelMetadata[modelId] = {
      id: modelId,
      registrationDate: new Date().toISOString(),
      ...metadata
    };
    
    this.logger.info(`AI model registered: ${modelId}`, { modelId, metadata });
    
    return this.modelMetadata[modelId];
  }
  
  /**
   * Get metadata for a registered model
   * @param {string} modelId - Model identifier
   * @returns {Object|null} Model metadata or null if not found
   */
  getModelMetadata(modelId) {
    return this.modelMetadata[modelId] || null;
  }
  
  /**
   * Get all registered model metadata
   * @returns {Object} All model metadata
   */
  getAllModelMetadata() {
    return { ...this.modelMetadata };
  }
  
  /**
   * Log an AI decision for transparency and auditing
   * @param {string} modelId - Model identifier
   * @param {Object} decision - Decision details
   * @param {string} decision.requestId - Unique request identifier
   * @param {string} decision.userId - User identifier
   * @param {Object} decision.input - Input data (sanitized)
   * @param {Object} decision.output - Output data
   * @param {Object} [decision.explanation] - Explanation of the decision
   * @param {string} [decision.category] - Decision category
   * @returns {string} Decision ID
   */
  logDecision(modelId, decision) {
    if (!modelId || !this.modelMetadata[modelId]) {
      throw new Error('Invalid or unregistered model ID');
    }
    
    const requiredFields = ['requestId', 'userId', 'input', 'output'];
    for (const field of requiredFields) {
      if (!decision[field]) {
        throw new Error(`Required decision field missing: ${field}`);
      }
    }
    
    const decisionLog = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      modelId,
      modelName: this.modelMetadata[modelId].name,
      modelVersion: this.modelMetadata[modelId].version,
      ...decision
    };
    
    this.decisions.push(decisionLog);
    
    // Add to audit log
    this.auditLog.push({
      type: 'decision',
      timestamp: decisionLog.timestamp,
      modelId,
      requestId: decision.requestId,
      userId: decision.userId
    });
    
    this.logger.debug(`AI decision logged: ${decisionLog.id}`, { modelId, decisionId: decisionLog.id });
    
    return decisionLog.id;
  }
  
  /**
   * Get a specific decision by ID
   * @param {string} decisionId - Decision identifier
   * @returns {Object|null} Decision log or null if not found
   */
  getDecision(decisionId) {
    return this.decisions.find(d => d.id === decisionId) || null;
  }
  
  /**
   * Get decisions by model ID
   * @param {string} modelId - Model identifier
   * @param {number} [limit=100] - Maximum number of decisions to return
   * @returns {Array} Decision logs
   */
  getDecisionsByModel(modelId, limit = 100) {
    return this.decisions
      .filter(d => d.modelId === modelId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Get decisions by user ID
   * @param {string} userId - User identifier
   * @param {number} [limit=100] - Maximum number of decisions to return
   * @returns {Array} Decision logs
   */
  getDecisionsByUser(userId, limit = 100) {
    return this.decisions
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Analyze text for potential bias using the sensitive terms list
   * @param {string} text - Text to analyze
   * @returns {Object} Analysis results
   */
  analyzeTextForBias(text) {
    if (!text || typeof text !== 'string') {
      return { biasDetected: false, terms: [], text: '' };
    }
    
    const lowerText = text.toLowerCase();
    const detectedTerms = [];
    
    for (const term of this.sensitiveTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        detectedTerms.push(term);
      }
    }
    
    return {
      biasDetected: detectedTerms.length > 0,
      terms: detectedTerms,
      text
    };
  }
  
  /**
   * Report potential bias in AI output
   * @param {string} modelId - Model identifier
   * @param {string} decisionId - Decision identifier
   * @param {Object} biasReport - Bias report details
   * @param {string} biasReport.userId - User reporting the bias
   * @param {string} biasReport.type - Type of bias ('gender', 'race', 'age', etc.)
   * @param {string} biasReport.description - Description of the bias
   * @param {string} [biasReport.evidence] - Evidence of bias
   * @returns {string} Bias report ID
   */
  reportBias(modelId, decisionId, biasReport) {
    if (!modelId || !this.modelMetadata[modelId]) {
      throw new Error('Invalid or unregistered model ID');
    }
    
    const requiredFields = ['userId', 'type', 'description'];
    for (const field of requiredFields) {
      if (!biasReport[field]) {
        throw new Error(`Required bias report field missing: ${field}`);
      }
    }
    
    const reportLog = {
      id: `bias-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      modelId,
      decisionId,
      status: 'reported',
      resolution: null,
      ...biasReport
    };
    
    this.biasReports.push(reportLog);
    
    // Add to audit log
    this.auditLog.push({
      type: 'bias_report',
      timestamp: reportLog.timestamp,
      modelId,
      decisionId,
      userId: biasReport.userId,
      biasType: biasReport.type
    });
    
    this.logger.warn(`Bias reported: ${reportLog.id}`, {
      modelId,
      decisionId,
      biasType: biasReport.type,
      reportId: reportLog.id
    });
    
    return reportLog.id;
  }
  
  /**
   * Update the status of a bias report
   * @param {string} reportId - Bias report identifier
   * @param {string} status - New status ('reported', 'investigating', 'resolved', 'rejected')
   * @param {string} resolution - Resolution description
   * @returns {Object|null} Updated report or null if not found
   */
  updateBiasReport(reportId, status, resolution) {
    const report = this.biasReports.find(r => r.id === reportId);
    
    if (!report) {
      return null;
    }
    
    report.status = status;
    report.resolution = resolution;
    report.updatedAt = new Date().toISOString();
    
    // Add to audit log
    this.auditLog.push({
      type: 'bias_report_update',
      timestamp: report.updatedAt,
      reportId,
      status,
      resolution
    });
    
    this.logger.info(`Bias report updated: ${reportId}`, { reportId, status, resolution });
    
    return report;
  }
  
  /**
   * Get a specific bias report by ID
   * @param {string} reportId - Bias report identifier
   * @returns {Object|null} Bias report or null if not found
   */
  getBiasReport(reportId) {
    return this.biasReports.find(r => r.id === reportId) || null;
  }
  
  /**
   * Get bias reports by model ID
   * @param {string} modelId - Model identifier
   * @param {number} [limit=100] - Maximum number of reports to return
   * @returns {Array} Bias reports
   */
  getBiasReportsByModel(modelId, limit = 100) {
    return this.biasReports
      .filter(r => r.modelId === modelId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Add sensitive terms for bias detection
   * @param {Array} terms - Array of sensitive terms
   */
  addSensitiveTerms(terms) {
    if (!Array.isArray(terms)) {
      terms = [terms];
    }
    
    // Add unique terms
    for (const term of terms) {
      if (!this.sensitiveTerms.includes(term)) {
        this.sensitiveTerms.push(term);
      }
    }
    
    this.logger.info(`Added ${terms.length} sensitive terms for bias detection`);
  }
  
  /**
   * Remove sensitive terms from bias detection
   * @param {Array} terms - Array of sensitive terms to remove
   */
  removeSensitiveTerms(terms) {
    if (!Array.isArray(terms)) {
      terms = [terms];
    }
    
    // Remove specified terms
    this.sensitiveTerms = this.sensitiveTerms.filter(term => !terms.includes(term));
    
    this.logger.info(`Removed ${terms.length} sensitive terms from bias detection`);
  }
  
  /**
   * Get all sensitive terms
   * @returns {Array} Sensitive terms
   */
  getSensitiveTerms() {
    return [...this.sensitiveTerms];
  }
  
  /**
   * Get the audit log
   * @param {number} [limit=100] - Maximum number of entries to return
   * @returns {Array} Audit log entries
   */
  getAuditLog(limit = 100) {
    return this.auditLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  /**
   * Generate an explanation for an AI decision
   * @param {string} modelId - Model identifier
   * @param {Object} decision - Decision details
   * @returns {Object} Explanation object
   */
  generateExplanation(modelId, decision) {
    const model = this.modelMetadata[modelId];
    
    if (!model) {
      throw new Error('Invalid or unregistered model ID');
    }
    
    // Basic explanation structure
    const explanation = {
      modelInfo: {
        name: model.name,
        version: model.version,
        provider: model.provider,
        type: model.type,
        description: model.description || 'No description provided'
      },
      limitations: model.limitations || {},
      knownBiases: model.biases || {},
      decisionFactors: [],
      confidence: null,
      alternatives: []
    };
    
    // In a real implementation, this would be model-specific
    // and potentially call the AI system to generate explanations
    
    return explanation;
  }
  
  /**
   * Check if a use case is approved for a model
   * @param {string} modelId - Model identifier
   * @param {string} useCase - Use case to check
   * @returns {boolean} Whether the use case is approved
   */
  isApprovedUseCase(modelId, useCase) {
    const model = this.modelMetadata[modelId];
    
    if (!model || !model.useCases || !Array.isArray(model.useCases)) {
      return false;
    }
    
    return model.useCases.some(uc => uc.toLowerCase() === useCase.toLowerCase());
  }
  
  /**
   * Export all governance data for backup or audit
   * @returns {Object} All governance data
   */
  exportData() {
    return {
      exportDate: new Date().toISOString(),
      modelMetadata: this.modelMetadata,
      decisions: this.decisions,
      biasReports: this.biasReports,
      auditLog: this.auditLog,
      sensitiveTerms: this.sensitiveTerms
    };
  }
}

module.exports = AIGovernance;