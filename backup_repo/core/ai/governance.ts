/**
 * AI Governance Module for Bolt DIY
 * 
 * This module provides governance, ethics, and bias mitigation functionality
 * for AI systems used within the platform. It's adapted from the docs-system
 * AI governance module.
 */

import { injectable } from 'tsyringe';

/**
 * AI Governance class for managing AI ethics, transparency, and fairness
 */
@injectable()
export class AIGovernance {
  private modelMetadata: Record<string, any>;
  private logger: Console;
  private sensitiveTerms: string[];
  private decisions: any[];
  private biasReports: any[];
  private auditLog: any[];

  /**
   * Create a new AIGovernance instance
   * @param options - Configuration options
   */
  constructor(options: {
    modelMetadata?: Record<string, any>;
    logger?: Console;
    sensitiveTerms?: string[];
  } = {}) {
    this.modelMetadata = options.modelMetadata || {};
    this.logger = options.logger || console;
    this.sensitiveTerms = options.sensitiveTerms || [];
    this.decisions = [];
    this.biasReports = [];
    this.auditLog = [];
  }
  
  /**
   * Register an AI model with its metadata
   * @param modelId - Unique identifier for the model
   * @param metadata - Model metadata
   */
  registerModel(modelId: string, metadata: {
    name: string;
    version: string;
    provider: string;
    type: string;
    description?: string;
    trainingDatasets?: string[];
    limitations?: Record<string, any>;
    biases?: Record<string, any>;
    useCases?: string[];
    ethicalGuidelines?: string[];
  }): Record<string, any> {
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
   * @param modelId - Model identifier
   * @returns Model metadata or null if not found
   */
  getModelMetadata(modelId: string): Record<string, any> | null {
    return this.modelMetadata[modelId] || null;
  }
  
  /**
   * Get all registered model metadata
   * @returns All model metadata
   */
  getAllModelMetadata(): Record<string, any> {
    return { ...this.modelMetadata };
  }
  
  /**
   * Log an AI decision for transparency and auditing
   * @param modelId - Model identifier
   * @param decision - Decision details
   * @returns Decision ID
   */
  logDecision(modelId: string, decision: {
    requestId: string;
    userId: string;
    input: Record<string, any>;
    output: Record<string, any>;
    explanation?: Record<string, any>;
    category?: string;
  }): string {
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
   * @param decisionId - Decision identifier
   * @returns Decision log or null if not found
   */
  getDecision(decisionId: string): Record<string, any> | null {
    return this.decisions.find(d => d.id === decisionId) || null;
  }
  
  /**
   * Get decisions by model ID
   * @param modelId - Model identifier
   * @param limit - Maximum number of decisions to return
   * @returns Decision logs
   */
  getDecisionsByModel(modelId: string, limit = 100): Record<string, any>[] {
    return this.decisions
      .filter(d => d.modelId === modelId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * Get decisions by user ID
   * @param userId - User identifier
   * @param limit - Maximum number of decisions to return
   * @returns Decision logs
   */
  getDecisionsByUser(userId: string, limit = 100): Record<string, any>[] {
    return this.decisions
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * Analyze text for potential bias using the sensitive terms list
   * @param text - Text to analyze
   * @returns Analysis results
   */
  analyzeTextForBias(text: string): {
    biasDetected: boolean;
    terms: string[];
    text: string;
  } {
    if (!text || typeof text !== 'string') {
      return { biasDetected: false, terms: [], text: '' };
    }
    
    const lowerText = text.toLowerCase();
    const detectedTerms: string[] = [];
    
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
   * @param modelId - Model identifier
   * @param decisionId - Decision identifier
   * @param biasReport - Bias report details
   * @returns Bias report ID
   */
  reportBias(modelId: string, decisionId: string, biasReport: {
    userId: string;
    type: string;
    description: string;
    evidence?: string;
  }): string {
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
   * @param reportId - Bias report identifier
   * @param status - New status ('reported', 'investigating', 'resolved', 'rejected')
   * @param resolution - Resolution description
   * @returns Updated report or null if not found
   */
  updateBiasReport(reportId: string, status: string, resolution: string): Record<string, any> | null {
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
   * @param reportId - Bias report identifier
   * @returns Bias report or null if not found
   */
  getBiasReport(reportId: string): Record<string, any> | null {
    return this.biasReports.find(r => r.id === reportId) || null;
  }
  
  /**
   * Get bias reports by model ID
   * @param modelId - Model identifier
   * @param limit - Maximum number of reports to return
   * @returns Bias reports
   */
  getBiasReportsByModel(modelId: string, limit = 100): Record<string, any>[] {
    return this.biasReports
      .filter(r => r.modelId === modelId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * Add sensitive terms for bias detection
   * @param terms - Array of sensitive terms
   */
  addSensitiveTerms(terms: string | string[]): void {
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
   * @param terms - Array of sensitive terms to remove
   */
  removeSensitiveTerms(terms: string | string[]): void {
    if (!Array.isArray(terms)) {
      terms = [terms];
    }
    
    // Remove specified terms
    this.sensitiveTerms = this.sensitiveTerms.filter(term => !terms.includes(term));
    
    this.logger.info(`Removed ${terms.length} sensitive terms from bias detection`);
  }
  
  /**
   * Get all sensitive terms
   * @returns Sensitive terms
   */
  getSensitiveTerms(): string[] {
    return [...this.sensitiveTerms];
  }
  
  /**
   * Get the audit log
   * @param limit - Maximum number of entries to return
   * @returns Audit log entries
   */
  getAuditLog(limit = 100): Record<string, any>[] {
    return this.auditLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * Generate an explanation for an AI decision
   * @param modelId - Model identifier
   * @param decision - Decision details
   * @returns Explanation object
   */
  generateExplanation(modelId: string, decision: Record<string, any>): Record<string, any> {
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
    
    return explanation;
  }
  
  /**
   * Check if a use case is approved for a model
   * @param modelId - Model identifier
   * @param useCase - Use case to check
   * @returns Whether the use case is approved
   */
  isApprovedUseCase(modelId: string, useCase: string): boolean {
    const model = this.modelMetadata[modelId];
    
    if (!model || !model.useCases || !Array.isArray(model.useCases)) {
      return false;
    }
    
    return model.useCases.some(uc => uc.toLowerCase() === useCase.toLowerCase());
  }
  
  /**
   * Export all governance data for backup or audit
   * @returns All governance data
   */
  exportData(): Record<string, any> {
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