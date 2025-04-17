/**
 * Monitoring Module for Bolt DIY
 * 
 * This module exports monitoring tools for tracking performance,
 * errors, and user interactions.
 */

export * from './sentry-sdk';

// Performance Monitoring
export interface RequestMetrics {
  /** Unique request ID */
  requestId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  errorOccurred: boolean;
  errorType?: string;
  promptTokens?: number;
  responseTokens?: number;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  // Store metrics for recent requests
  private static metrics: RequestMetrics[] = [];
  
  // Maximum number of metrics to store
  private static maxMetricsEntries = 100;
  
  /**
   * Start monitoring a request
   * @param sessionId - Session identifier
   * @returns Initial metrics object
   */
  static startRequest(sessionId: string): RequestMetrics {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const metrics: RequestMetrics = {
      requestId,
      sessionId,
      startTime: Date.now(),
      errorOccurred: false
    };
    
    return metrics;
  }
  
  /**
   * End monitoring for a request
   * @param metrics - Metrics object from startRequest
   * @param response - Final response or error
   * @returns Updated metrics
   */
  static endRequest(metrics: RequestMetrics, response: any): RequestMetrics {
    // Set end time and calculate duration
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    // Estimate token counts
    if (typeof response === 'string') {
      // Simple estimation (4 chars per token)
      metrics.responseTokens = Math.ceil(response.length / 4);
    }
    
    // Store metrics
    this.storeMetrics(metrics);
    
    return metrics;
  }
  
  /**
   * Store metrics for later analysis
   * @param metrics - Metrics to store
   */
  private static storeMetrics(metrics: RequestMetrics): void {
    // Add to metrics store
    this.metrics.push(metrics);
    
    // Limit size of metrics store
    if (this.metrics.length > this.maxMetricsEntries) {
      this.metrics.shift();
    }
    
    // Log metrics for monitoring
    console.info('[Performance]', {
      requestId: metrics.requestId,
      duration: metrics.duration,
      error: metrics.errorOccurred,
      errorType: metrics.errorType
    });
  }
  
  /**
   * Get recent performance metrics
   * @param limit - Maximum number of entries to return
   * @returns Recent metrics
   */
  static getRecentMetrics(limit = 10): RequestMetrics[] {
    return this.metrics
      .slice(-limit)
      .sort((a, b) => b.startTime - a.startTime);
  }
  
  /**
   * Calculate average request duration
   * @param sessionId - Optional session to filter by
   * @returns Average duration in milliseconds
   */
  static getAverageDuration(sessionId?: string): number {
    const filteredMetrics = sessionId
      ? this.metrics.filter(m => m.sessionId === sessionId)
      : this.metrics;
    
    if (filteredMetrics.length === 0) {
      return 0;
    }
    
    const totalDuration = filteredMetrics.reduce((sum, metrics) => {
      return sum + (metrics.duration || 0);
    }, 0);
    
    return totalDuration / filteredMetrics.length;
  }
  
  /**
   * Calculate error rate
   * @param sessionId - Optional session to filter by
   * @returns Error rate as a percentage
   */
  static getErrorRate(sessionId?: string): number {
    const filteredMetrics = sessionId
      ? this.metrics.filter(m => m.sessionId === sessionId)
      : this.metrics;
    
    if (filteredMetrics.length === 0) {
      return 0;
    }
    
    const errorCount = filteredMetrics.filter(m => m.errorOccurred).length;
    return (errorCount / filteredMetrics.length) * 100;
  }
}