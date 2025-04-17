/**
 * Analytics SDK for Bolt DIY
 * 
 * This module provides a simple analytics interface for tracking events,
 * errors, and performance metrics. It's designed to be easily replaced
 * with a more robust implementation in production.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Analytics SDK for tracking events, errors, and performance
 */
export class AnalyticsSDK {
  private static instance: AnalyticsSDK;
  private events: AnalyticsEvent[] = [];
  private errors: ErrorEvent[] = [];
  private enabled: boolean = true;
  
  /**
   * Get the singleton instance of AnalyticsSDK
   */
  public static getInstance(): AnalyticsSDK {
    if (!AnalyticsSDK.instance) {
      AnalyticsSDK.instance = new AnalyticsSDK();
    }
    return AnalyticsSDK.instance;
  }

  /**
   * Enable or disable analytics collection
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Track a user or system event
   * @param eventName - Name of the event to track
   * @param properties - Additional properties for the event
   */
  public trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.enabled) return;
    
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    console.debug(`[Analytics] Event tracked: ${eventName}`, properties);
    
    // In a real implementation, this would send data to an analytics service
  }

  /**
   * Track an error event
   * @param error - Error object or message
   * @param metadata - Additional context for the error
   * @returns A unique error ID
   */
  public trackError(error: Error | string, metadata: Record<string, any> = {}): string {
    if (!this.enabled) return 'analytics-disabled';
    
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const errorEvent: ErrorEvent = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        ...metadata,
        errorId
      },
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(errorEvent);
    console.debug(`[Analytics] Error tracked: ${errorEvent.message}`, { errorId, metadata });
    
    // In a real implementation, this would send data to an error tracking service
    return errorId;
  }

  /**
   * Start timing an operation for performance tracking
   * @param operationName - Name of the operation to time
   * @returns A function to call when the operation completes
   */
  public startTimer(operationName: string): () => void {
    if (!this.enabled) return () => {};
    
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.trackEvent('performance', {
        operation: operationName,
        durationMs: duration
      });
    };
  }

  /**
   * Get all collected analytics data (for debugging)
   */
  public getAllData(): { events: AnalyticsEvent[], errors: ErrorEvent[] } {
    return {
      events: [...this.events],
      errors: [...this.errors]
    };
  }

  /**
   * Clear all collected analytics data
   */
  public clearData(): void {
    this.events = [];
    this.errors = [];
  }
}

// Export a singleton instance
export default AnalyticsSDK.getInstance();