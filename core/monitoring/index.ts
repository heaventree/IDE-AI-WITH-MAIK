/**
 * Monitoring module for Bolt DIY
 * 
 * This module exports various monitoring tools and utilities for error
 * tracking, analytics, and performance monitoring.
 */

export { default as AnalyticsSDK } from './analytics-sdk';
export { SentrySDK } from './sentry-sdk';

/**
 * Performance monitoring for tracking the timing of operations
 */
export class PerformanceMonitor {
  /**
   * Start timing a request for performance monitoring
   * @param sessionId - The session identifier
   * @returns A metrics object for tracking request performance
   */
  static startRequest(sessionId: string) {
    return {
      sessionId,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      errorOccurred: false,
      errorType: '',
      completed: false
    };
  }

  /**
   * End timing for a request and process metrics
   * @param metrics - The metrics object from startRequest
   * @param response - The response generated for the request
   */
  static endRequest(metrics: any, response: any) {
    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.completed = true;

    // In a real implementation, we would send these metrics to a monitoring service
    console.debug('[Performance] Request completed', {
      sessionId: metrics.sessionId,
      durationMs: metrics.duration.toFixed(2),
      error: metrics.errorOccurred,
      errorType: metrics.errorType
    });

    // Log slow requests
    if (metrics.duration > 2000) {
      console.warn('[Performance] Slow request detected', {
        sessionId: metrics.sessionId,
        durationMs: metrics.duration.toFixed(2)
      });
    }
  }
}