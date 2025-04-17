/**
 * Performance Monitoring Module for Documentation System
 * 
 * This module provides performance monitoring, tracing, and optimization
 * capabilities to ensure system efficiency and responsiveness.
 */

/**
 * Performance Monitor class for tracking and optimizing performance
 */
class PerformanceMonitor {
  /**
   * Create a new PerformanceMonitor instance
   * @param {Object} [options] - Configuration options
   * @param {Function} [options.storage] - Storage provider for metrics
   * @param {Function} [options.logger] - Logging function
   * @param {number} [options.sampleRate=1.0] - Sampling rate (0.0-1.0)
   * @param {boolean} [options.autoInstrument=true] - Whether to auto-instrument express/http
   * @param {Array<Function>} [options.plugins] - Monitoring plugins
   */
  constructor(options = {}) {
    this.storage = options.storage || new MemoryStorage();
    this.logger = options.logger || console;
    this.sampleRate = options.sampleRate !== undefined ? options.sampleRate : 1.0;
    this.autoInstrument = options.autoInstrument !== false;
    this.plugins = options.plugins || [];
    
    this.spans = new Map(); // Active spans
    this.metrics = {}; // Collected metrics
    this.resourceUsage = {}; // Resource usage stats
    this.thresholds = this._getDefaultThresholds();
    this.slowTraces = []; // Traces that exceeded thresholds
    
    // Initialize
    this._initialize();
  }
  
  /**
   * Initialize the performance monitor
   * @private
   */
  _initialize() {
    // Initialize metrics
    this.metrics = {
      counters: {},
      gauges: {},
      histograms: {},
      timers: {}
    };
    
    // Initialize resource usage
    this.resourceUsage = {
      cpu: {
        usage: 0,
        trend: []
      },
      memory: {
        used: 0,
        total: 0,
        trend: []
      },
      eventLoop: {
        latency: 0,
        trend: []
      }
    };
    
    // Auto-instrument if enabled
    if (this.autoInstrument) {
      this._setupAutoInstrumentation();
    }
    
    // Initialize plugins
    this.plugins.forEach(plugin => {
      try {
        plugin.initialize(this);
      } catch (error) {
        this.logger.error(`Failed to initialize plugin: ${error.message}`, error);
      }
    });
    
    // Start resource monitoring
    this._startResourceMonitoring();
  }
  
  /**
   * Start a new trace
   * @param {string} name - Trace name
   * @param {Object} [options] - Trace options
   * @param {Object} [options.attributes={}] - Trace attributes
   * @param {string} [options.parentSpanId] - Parent span ID
   * @returns {string} Trace ID
   */
  startTrace(name, options = {}) {
    if (Math.random() > this.sampleRate) {
      return null; // Skip this trace due to sampling
    }
    
    const traceId = this._generateId();
    const rootSpan = this.startSpan(name, {
      ...options,
      traceId
    });
    
    return traceId;
  }
  
  /**
   * Start a new span (part of a trace)
   * @param {string} name - Span name
   * @param {Object} [options] - Span options
   * @param {string} [options.traceId] - Trace ID
   * @param {string} [options.parentSpanId] - Parent span ID
   * @param {Object} [options.attributes={}] - Span attributes
   * @returns {string} Span ID
   */
  startSpan(name, options = {}) {
    const spanId = this._generateId();
    const traceId = options.traceId || spanId; // If no traceId, span is its own trace
    const parentSpanId = options.parentSpanId;
    const startTime = Date.now();
    
    const span = {
      id: spanId,
      name,
      traceId,
      parentSpanId,
      startTime,
      attributes: options.attributes || {},
      events: []
    };
    
    this.spans.set(spanId, span);
    
    return spanId;
  }
  
  /**
   * End a span
   * @param {string} spanId - Span ID
   * @param {Object} [options] - End options
   * @param {Object} [options.attributes={}] - Additional span attributes
   * @param {Error} [options.error] - Error if span failed
   * @returns {Object} Completed span
   */
  endSpan(spanId, options = {}) {
    const span = this.spans.get(spanId);
    
    if (!span) {
      this.logger.warn(`Attempted to end unknown span: ${spanId}`);
      return null;
    }
    
    // Set end time and duration
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = options.error ? 'error' : 'success';
    
    // Add additional attributes
    if (options.attributes) {
      span.attributes = {
        ...span.attributes,
        ...options.attributes
      };
    }
    
    // Add error information if present
    if (options.error) {
      span.error = {
        message: options.error.message,
        stack: options.error.stack,
        name: options.error.name
      };
      
      this.addSpanEvent(spanId, 'error', {
        message: options.error.message,
        stack: options.error.stack,
        name: options.error.name
      });
    }
    
    // Remove from active spans
    this.spans.delete(spanId);
    
    // Find the root span for this trace
    const isRootSpan = !span.parentSpanId;
    
    // If this is a root span, record the complete trace
    if (isRootSpan) {
      this._recordTrace(span);
    }
    
    // Track in histogram
    this._recordDuration(`span.${span.name}`, span.duration);
    
    // Check if span exceeded slow threshold
    const threshold = this.thresholds.spans[span.name] || this.thresholds.default;
    if (span.duration > threshold) {
      this._recordSlowTrace(span);
    }
    
    return span;
  }
  
  /**
   * Add an event to a span
   * @param {string} spanId - Span ID
   * @param {string} name - Event name
   * @param {Object} [attributes={}] - Event attributes
   * @returns {boolean} Whether the event was added
   */
  addSpanEvent(spanId, name, attributes = {}) {
    const span = this.spans.get(spanId);
    
    if (!span) {
      return false;
    }
    
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
    
    return true;
  }
  
  /**
   * Set span attributes
   * @param {string} spanId - Span ID
   * @param {Object} attributes - Attributes to set
   * @returns {boolean} Whether the attributes were set
   */
  setSpanAttributes(spanId, attributes) {
    const span = this.spans.get(spanId);
    
    if (!span) {
      return false;
    }
    
    span.attributes = {
      ...span.attributes,
      ...attributes
    };
    
    return true;
  }
  
  /**
   * Increment a counter
   * @param {string} name - Counter name
   * @param {number} [value=1] - Value to increment by
   * @param {Object} [tags={}] - Counter tags
   */
  incrementCounter(name, value = 1, tags = {}) {
    if (!this.metrics.counters[name]) {
      this.metrics.counters[name] = {
        value: 0,
        tags: {}
      };
    }
    
    this.metrics.counters[name].value += value;
    this.metrics.counters[name].tags = {
      ...this.metrics.counters[name].tags,
      ...tags
    };
  }
  
  /**
   * Set a gauge value
   * @param {string} name - Gauge name
   * @param {number} value - Gauge value
   * @param {Object} [tags={}] - Gauge tags
   */
  setGauge(name, value, tags = {}) {
    this.metrics.gauges[name] = {
      value,
      timestamp: Date.now(),
      tags
    };
  }
  
  /**
   * Record a duration in a histogram
   * @param {string} name - Histogram name
   * @param {number} value - Value to record
   * @param {Object} [tags={}] - Histogram tags
   */
  recordDuration(name, value, tags = {}) {
    this._recordDuration(name, value, tags);
  }
  
  /**
   * Create a timer that records duration when stopped
   * @param {string} name - Timer name
   * @param {Object} [tags={}] - Timer tags
   * @returns {Object} Timer object with stop method
   */
  startTimer(name, tags = {}) {
    const startTime = Date.now();
    
    return {
      stop: () => {
        const duration = Date.now() - startTime;
        this._recordDuration(name, duration, tags);
        return duration;
      }
    };
  }
  
  /**
   * Track a function call
   * @param {string} name - Function name
   * @param {Function} fn - Function to track
   * @param {Object} [options] - Track options
   * @param {Object} [options.tags={}] - Span/timer tags
   * @param {boolean} [options.createSpan=true] - Whether to create a span
   * @returns {Function} Wrapped function
   */
  trackFunction(name, fn, options = {}) {
    const tags = options.tags || {};
    const createSpan = options.createSpan !== false;
    
    return async (...args) => {
      const timer = this.startTimer(`function.${name}`, tags);
      let spanId = null;
      
      if (createSpan) {
        spanId = this.startSpan(`function:${name}`, { attributes: tags });
      }
      
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        this.incrementCounter(`function.${name}.error`, 1, tags);
        
        if (spanId) {
          this.addSpanEvent(spanId, 'error', {
            message: error.message,
            stack: error.stack
          });
        }
        
        throw error;
      } finally {
        timer.stop();
        
        if (spanId) {
          this.endSpan(spanId);
        }
      }
    };
  }
  
  /**
   * Set a performance threshold
   * @param {string} name - Threshold name (e.g., 'spans.http', 'default')
   * @param {number} value - Threshold value in ms
   */
  setThreshold(name, value) {
    if (name.startsWith('spans.')) {
      const spanName = name.substring(6);
      this.thresholds.spans[spanName] = value;
    } else if (name === 'default') {
      this.thresholds.default = value;
    }
  }
  
  /**
   * Get current metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      counters: { ...this.metrics.counters },
      gauges: { ...this.metrics.gauges },
      histograms: { ...this.metrics.histograms },
      resourceUsage: { ...this.resourceUsage }
    };
  }
  
  /**
   * Get slow traces
   * @param {number} [limit=10] - Maximum number of traces to return
   * @returns {Array} Slow traces
   */
  getSlowTraces(limit = 10) {
    return this.slowTraces.slice(0, limit);
  }
  
  /**
   * Create middleware for Express
   * @returns {Function} Express middleware
   */
  expressMiddleware() {
    return (req, res, next) => {
      const traceId = this.startTrace('http', {
        attributes: {
          method: req.method,
          url: req.url,
          userAgent: req.get('user-agent'),
          referer: req.get('referer'),
          ip: req.ip
        }
      });
      
      // Store trace ID in request
      req._perfTraceId = traceId;
      
      // Track response time
      const startTime = Date.now();
      
      // Track response
      const end = res.end;
      res.end = (chunk, encoding) => {
        // Calculate response time
        const duration = Date.now() - startTime;
        
        // Record response
        this.endSpan(traceId, {
          attributes: {
            statusCode: res.statusCode,
            contentType: res.get('content-type'),
            contentLength: res.get('content-length'),
            duration
          }
        });
        
        // Record in metrics
        this.incrementCounter('http.requests', 1, {
          method: req.method,
          status: res.statusCode,
          route: req.route ? req.route.path : 'unknown'
        });
        
        this.recordDuration('http.response_time', duration, {
          method: req.method,
          status: res.statusCode,
          route: req.route ? req.route.path : 'unknown'
        });
        
        // Call original end
        end.call(res, chunk, encoding);
      };
      
      next();
    };
  }
  
  /**
   * Create error tracking middleware for Express
   * @returns {Function} Express error middleware
   */
  expressErrorMiddleware() {
    return (err, req, res, next) => {
      // Track error
      this.incrementCounter('http.errors', 1, {
        method: req.method,
        url: req.url,
        error: err.name
      });
      
      // Add error to span if trace exists
      if (req._perfTraceId) {
        this.addSpanEvent(req._perfTraceId, 'error', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      }
      
      next(err);
    };
  }
  
  /**
   * Record resource metrics to storage
   * @param {Object} [options] - Storage options
   * @returns {Promise<boolean>} Whether the metrics were recorded
   */
  async recordMetrics(options = {}) {
    try {
      await this.storage.saveMetrics({
        timestamp: Date.now(),
        counters: { ...this.metrics.counters },
        gauges: { ...this.metrics.gauges },
        histograms: { ...this.metrics.histograms },
        resourceUsage: { ...this.resourceUsage }
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to record metrics', error);
      return false;
    }
  }
  
  /**
   * Generate a performance report
   * @param {Object} [options] - Report options
   * @param {string} [options.format='json'] - Report format ('json', 'html')
   * @param {number} [options.duration=3600000] - Time period in ms (default: 1 hour)
   * @returns {Promise<Object|string>} Performance report
   */
  async generateReport(options = {}) {
    const format = options.format || 'json';
    const duration = options.duration || 3600000; // 1 hour
    
    const endTime = Date.now();
    const startTime = endTime - duration;
    
    try {
      // Get metrics for the time period
      const metrics = await this.storage.getMetrics(startTime, endTime);
      
      // Get slow traces
      const slowTraces = await this.storage.getSlowTraces(startTime, endTime);
      
      // Generate the report
      const report = {
        timestamp: new Date().toISOString(),
        timePeriod: {
          start: new Date(startTime).toISOString(),
          end: new Date(endTime).toISOString(),
          durationMs: duration
        },
        summary: this._generateSummary(metrics),
        metrics: this._analyzeMetrics(metrics),
        slowTraces: slowTraces.slice(0, 10),
        recommendations: this._generateRecommendations(metrics, slowTraces)
      };
      
      // Format the report
      if (format === 'html') {
        return this._formatReportHtml(report);
      }
      
      return report;
    } catch (error) {
      this.logger.error('Failed to generate performance report', error);
      return {
        error: 'Failed to generate report',
        message: error.message
      };
    }
  }
  
  /**
   * Record a duration in a histogram
   * @param {string} name - Histogram name
   * @param {number} value - Value to record
   * @param {Object} [tags={}] - Histogram tags
   * @private
   */
  _recordDuration(name, value, tags = {}) {
    if (!this.metrics.histograms[name]) {
      this.metrics.histograms[name] = {
        count: 0,
        sum: 0,
        min: value,
        max: value,
        avg: value,
        p95: value,
        p99: value,
        values: [],
        tags: {}
      };
    }
    
    const histogram = this.metrics.histograms[name];
    
    // Update histogram
    histogram.count += 1;
    histogram.sum += value;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);
    histogram.avg = histogram.sum / histogram.count;
    
    // Store value for percentile calculation
    histogram.values.push(value);
    
    // Limit stored values to 1000
    if (histogram.values.length > 1000) {
      histogram.values.shift();
    }
    
    // Update percentiles
    if (histogram.values.length > 1) {
      // Sort values
      const sorted = [...histogram.values].sort((a, b) => a - b);
      
      // Calculate p95
      const p95Index = Math.floor(sorted.length * 0.95);
      histogram.p95 = sorted[p95Index];
      
      // Calculate p99
      const p99Index = Math.floor(sorted.length * 0.99);
      histogram.p99 = sorted[p99Index];
    }
    
    // Update tags
    histogram.tags = {
      ...histogram.tags,
      ...tags
    };
  }
  
  /**
   * Record a complete trace
   * @param {Object} rootSpan - Root span of the trace
   * @private
   */
  async _recordTrace(rootSpan) {
    try {
      await this.storage.saveTrace({
        id: rootSpan.traceId,
        name: rootSpan.name,
        startTime: rootSpan.startTime,
        endTime: rootSpan.endTime,
        duration: rootSpan.duration,
        status: rootSpan.status,
        attributes: rootSpan.attributes,
        events: rootSpan.events,
        error: rootSpan.error
      });
    } catch (error) {
      this.logger.error('Failed to record trace', error);
    }
  }
  
  /**
   * Record a slow trace
   * @param {Object} span - Slow span
   * @private
   */
  _recordSlowTrace(span) {
    // Add to slow traces
    this.slowTraces.push({
      id: span.traceId,
      name: span.name,
      startTime: span.startTime,
      duration: span.duration,
      attributes: span.attributes,
      threshold: this.thresholds.spans[span.name] || this.thresholds.default
    });
    
    // Limit to 100 traces
    if (this.slowTraces.length > 100) {
      this.slowTraces.shift();
    }
    
    // Log slow trace
    this.logger.warn(`Slow trace detected: ${span.name} (${span.duration}ms)`, {
      traceId: span.traceId,
      name: span.name,
      duration: span.duration,
      threshold: this.thresholds.spans[span.name] || this.thresholds.default
    });
    
    // Store in storage
    try {
      this.storage.saveSlowTrace({
        id: span.traceId,
        name: span.name,
        startTime: span.startTime,
        endTime: span.endTime,
        duration: span.duration,
        threshold: this.thresholds.spans[span.name] || this.thresholds.default,
        attributes: span.attributes,
        events: span.events,
        error: span.error
      });
    } catch (error) {
      this.logger.error('Failed to store slow trace', error);
    }
  }
  
  /**
   * Start monitoring system resources
   * @private
   */
  _startResourceMonitoring() {
    const monitorInterval = 5000; // 5 seconds
    
    // Start monitoring
    setInterval(() => {
      this._updateResourceUsage();
    }, monitorInterval);
  }
  
  /**
   * Update resource usage metrics
   * @private
   */
  _updateResourceUsage() {
    try {
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      this.resourceUsage.memory.used = memoryUsage.heapUsed;
      this.resourceUsage.memory.total = memoryUsage.heapTotal;
      
      // Update memory trend (keep last 100 points)
      this.resourceUsage.memory.trend.push({
        timestamp: Date.now(),
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal
      });
      
      if (this.resourceUsage.memory.trend.length > 100) {
        this.resourceUsage.memory.trend.shift();
      }
      
      // Set memory gauge
      this.setGauge('memory.used', memoryUsage.heapUsed);
      this.setGauge('memory.total', memoryUsage.heapTotal);
      
      // Update CPU usage estimate (simple implementation)
      // In a production system, use a proper CPU measurement
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      // Wait a short time to measure CPU usage
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        const elapsed = (endTime - startTime) * 1000; // in microseconds
        
        const totalUsage = endUsage.user + endUsage.system;
        const cpuUsage = totalUsage / elapsed;
        
        this.resourceUsage.cpu.usage = cpuUsage;
        
        // Update CPU trend
        this.resourceUsage.cpu.trend.push({
          timestamp: Date.now(),
          usage: cpuUsage
        });
        
        if (this.resourceUsage.cpu.trend.length > 100) {
          this.resourceUsage.cpu.trend.shift();
        }
        
        // Set CPU gauge
        this.setGauge('cpu.usage', cpuUsage);
      }, 100);
      
      // Measure event loop latency
      const start = Date.now();
      
      setImmediate(() => {
        const latency = Date.now() - start;
        
        this.resourceUsage.eventLoop.latency = latency;
        
        // Update event loop trend
        this.resourceUsage.eventLoop.trend.push({
          timestamp: Date.now(),
          latency
        });
        
        if (this.resourceUsage.eventLoop.trend.length > 100) {
          this.resourceUsage.eventLoop.trend.shift();
        }
        
        // Set event loop gauge
        this.setGauge('eventLoop.latency', latency);
      });
    } catch (error) {
      this.logger.error('Error updating resource usage', error);
    }
  }
  
  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   * @private
   */
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Get default performance thresholds
   * @returns {Object} Default thresholds
   * @private
   */
  _getDefaultThresholds() {
    return {
      default: 1000, // Default threshold: 1000ms
      spans: {
        http: 1000, // HTTP requests: 1000ms
        database: 500, // Database operations: 500ms
        'function:renderDocument': 200, // Document rendering: 200ms
        'function:searchDocuments': 300, // Document search: 300ms
        'function:validateDocument': 100, // Document validation: 100ms
      }
    };
  }
  
  /**
   * Set up auto-instrumentation for Express/HTTP
   * @private
   */
  _setupAutoInstrumentation() {
    try {
      // Simplified auto-instrumentation
      // In a production system, use dynamic require/patching
      
      // For Express auto-instrumentation, you would patch express methods
      this.logger.info('Auto-instrumentation is enabled - use expressMiddleware() to add monitoring to Express apps');
    } catch (error) {
      this.logger.error('Failed to setup auto-instrumentation', error);
    }
  }
  
  /**
   * Generate a summary of performance metrics
   * @param {Array} metrics - Metrics data
   * @returns {Object} Metrics summary
   * @private
   */
  _generateSummary(metrics) {
    // Default summary
    const summary = {
      requestCount: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: [],
      memoryUsage: 0,
      cpuUsage: 0
    };
    
    if (!metrics || metrics.length === 0) {
      return summary;
    }
    
    try {
      // Analyze HTTP metrics
      let requestCount = 0;
      let errorCount = 0;
      const responseTimes = [];
      const endpointTimes = {};
      
      // Process metrics
      metrics.forEach(metricSet => {
        // Process HTTP counters
        Object.entries(metricSet.counters || {}).forEach(([name, counter]) => {
          if (name === 'http.requests') {
            requestCount += counter.value;
          }
          
          if (name === 'http.errors') {
            errorCount += counter.value;
          }
        });
        
        // Process response times
        Object.entries(metricSet.histograms || {}).forEach(([name, histogram]) => {
          if (name === 'http.response_time') {
            responseTimes.push(...histogram.values);
            
            // Track by endpoint
            const route = histogram.tags.route;
            if (route) {
              if (!endpointTimes[route]) {
                endpointTimes[route] = [];
              }
              endpointTimes[route].push(...histogram.values);
            }
          }
        });
        
        // Get resource usage from the most recent metrics
        if (metricSet.resourceUsage) {
          summary.memoryUsage = metricSet.resourceUsage.memory?.used || 0;
          summary.cpuUsage = metricSet.resourceUsage.cpu?.usage || 0;
        }
      });
      
      // Calculate summary stats
      summary.requestCount = requestCount;
      summary.errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      
      if (responseTimes.length > 0) {
        // Calculate average response time
        summary.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        // Calculate p95 response time
        const sortedTimes = [...responseTimes].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedTimes.length * 0.95);
        summary.p95ResponseTime = sortedTimes[p95Index] || 0;
      }
      
      // Get slowest endpoints
      summary.slowestEndpoints = Object.entries(endpointTimes)
        .map(([endpoint, times]) => ({
          endpoint,
          averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
          requestCount: times.length
        }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 5);
      
      return summary;
    } catch (error) {
      this.logger.error('Error generating summary', error);
      return summary;
    }
  }
  
  /**
   * Analyze metrics data
   * @param {Array} metrics - Metrics data
   * @returns {Object} Analyzed metrics
   * @private
   */
  _analyzeMetrics(metrics) {
    const analyzed = {
      http: {
        requestRate: {
          trend: [],
          average: 0
        },
        responseTime: {
          trend: [],
          average: 0
        },
        statusCodes: {}
      },
      memory: {
        trend: [],
        average: 0
      },
      cpu: {
        trend: [],
        average: 0
      }
    };
    
    if (!metrics || metrics.length === 0) {
      return analyzed;
    }
    
    try {
      // Get metrics ordered by timestamp
      const orderedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);
      
      // Track request counts by time window
      const requestsByMinute = {};
      
      // Process metrics
      orderedMetrics.forEach(metricSet => {
        // Get timestamp rounded to the minute
        const minute = Math.floor(metricSet.timestamp / 60000) * 60000;
        
        // Process HTTP counters
        Object.entries(metricSet.counters || {}).forEach(([name, counter]) => {
          if (name === 'http.requests') {
            // Add to requests by minute
            if (!requestsByMinute[minute]) {
              requestsByMinute[minute] = 0;
            }
            requestsByMinute[minute] += counter.value;
            
            // Count by status code
            const statusCode = counter.tags?.status;
            if (statusCode) {
              if (!analyzed.http.statusCodes[statusCode]) {
                analyzed.http.statusCodes[statusCode] = 0;
              }
              analyzed.http.statusCodes[statusCode] += counter.value;
            }
          }
        });
        
        // Process response times
        Object.entries(metricSet.histograms || {}).forEach(([name, histogram]) => {
          if (name === 'http.response_time') {
            analyzed.http.responseTime.trend.push({
              timestamp: metricSet.timestamp,
              value: histogram.avg
            });
          }
        });
        
        // Get resource usage trends
        if (metricSet.resourceUsage) {
          if (metricSet.resourceUsage.memory) {
            analyzed.memory.trend.push({
              timestamp: metricSet.timestamp,
              value: metricSet.resourceUsage.memory.used
            });
          }
          
          if (metricSet.resourceUsage.cpu) {
            analyzed.cpu.trend.push({
              timestamp: metricSet.timestamp,
              value: metricSet.resourceUsage.cpu.usage
            });
          }
        }
      });
      
      // Convert requests by minute to trend
      analyzed.http.requestRate.trend = Object.entries(requestsByMinute)
        .map(([timestamp, count]) => ({
          timestamp: parseInt(timestamp),
          value: count
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate averages
      if (analyzed.http.responseTime.trend.length > 0) {
        analyzed.http.responseTime.average = 
          analyzed.http.responseTime.trend.reduce((sum, point) => sum + point.value, 0) / 
          analyzed.http.responseTime.trend.length;
      }
      
      if (analyzed.http.requestRate.trend.length > 0) {
        analyzed.http.requestRate.average = 
          analyzed.http.requestRate.trend.reduce((sum, point) => sum + point.value, 0) / 
          analyzed.http.requestRate.trend.length;
      }
      
      if (analyzed.memory.trend.length > 0) {
        analyzed.memory.average = 
          analyzed.memory.trend.reduce((sum, point) => sum + point.value, 0) / 
          analyzed.memory.trend.length;
      }
      
      if (analyzed.cpu.trend.length > 0) {
        analyzed.cpu.average = 
          analyzed.cpu.trend.reduce((sum, point) => sum + point.value, 0) / 
          analyzed.cpu.trend.length;
      }
      
      return analyzed;
    } catch (error) {
      this.logger.error('Error analyzing metrics', error);
      return analyzed;
    }
  }
  
  /**
   * Generate optimization recommendations
   * @param {Array} metrics - Metrics data
   * @param {Array} slowTraces - Slow traces
   * @returns {Array} Recommendations
   * @private
   */
  _generateRecommendations(metrics, slowTraces) {
    const recommendations = [];
    
    if (!metrics || metrics.length === 0) {
      return recommendations;
    }
    
    try {
      // Analyze slow endpoints
      const summary = this._generateSummary(metrics);
      
      // Check for slow endpoints
      if (summary.slowestEndpoints.length > 0) {
        const slowest = summary.slowestEndpoints[0];
        
        if (slowest.averageTime > 500) {
          recommendations.push({
            type: 'endpoint_optimization',
            severity: 'high',
            description: `Optimize the slow endpoint: ${slowest.endpoint} (avg ${Math.round(slowest.averageTime)}ms)`,
            details: `This endpoint is responding slowly with an average response time of ${Math.round(slowest.averageTime)}ms over ${slowest.requestCount} requests.`
          });
        }
      }
      
      // Check high error rate
      if (summary.errorRate > 1) {
        recommendations.push({
          type: 'error_handling',
          severity: 'high',
          description: `Investigate high error rate: ${summary.errorRate.toFixed(2)}%`,
          details: `The application has a high error rate of ${summary.errorRate.toFixed(2)}% across ${summary.requestCount} requests.`
        });
      }
      
      // Check memory usage trends
      const analyzedMetrics = this._analyzeMetrics(metrics);
      
      if (analyzedMetrics.memory.trend.length > 1) {
        const firstMemory = analyzedMetrics.memory.trend[0].value;
        const lastMemory = analyzedMetrics.memory.trend[analyzedMetrics.memory.trend.length - 1].value;
        
        // Check for memory growth
        if (lastMemory > firstMemory * 1.5) {
          recommendations.push({
            type: 'memory_leak',
            severity: 'medium',
            description: 'Investigate potential memory leak',
            details: `Memory usage has increased from ${this._formatBytes(firstMemory)} to ${this._formatBytes(lastMemory)}.`
          });
        }
      }
      
      // Recommend caching for frequently accessed resources
      if (analyzedMetrics.http.requestRate.average > 10 && summary.averageResponseTime > 100) {
        recommendations.push({
          type: 'caching',
          severity: 'medium',
          description: 'Implement caching for frequently accessed resources',
          details: `With an average of ${Math.round(analyzedMetrics.http.requestRate.average)} requests per minute and ${Math.round(summary.averageResponseTime)}ms response time, caching could improve performance.`
        });
      }
      
      // Check for slow traces
      if (slowTraces && slowTraces.length > 0) {
        // Group by trace name
        const traceGroups = {};
        
        slowTraces.forEach(trace => {
          if (!traceGroups[trace.name]) {
            traceGroups[trace.name] = [];
          }
          traceGroups[trace.name].push(trace);
        });
        
        // Find most frequent slow traces
        Object.entries(traceGroups)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 3)
          .forEach(([name, traces]) => {
            const avgDuration = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;
            
            recommendations.push({
              type: 'trace_optimization',
              severity: 'medium',
              description: `Optimize slow operation: ${name}`,
              details: `This operation exceeded its threshold ${traces.length} times with an average duration of ${Math.round(avgDuration)}ms.`
            });
          });
      }
      
      return recommendations;
    } catch (error) {
      this.logger.error('Error generating recommendations', error);
      return recommendations;
    }
  }
  
  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  /**
   * Format a report as HTML
   * @param {Object} report - Report object
   * @returns {string} HTML report
   * @private
   */
  _formatReportHtml(report) {
    // Simple HTML report template
    return `<!DOCTYPE html>
<html>
<head>
  <title>Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { margin-top: 20px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .metric { margin-bottom: 10px; }
    .recommendations { margin-top: 20px; }
    .recommendation { background: #fff; padding: 15px; margin-bottom: 10px; border-left: 4px solid #ddd; }
    .high { border-left-color: #d9534f; }
    .medium { border-left-color: #f0ad4e; }
    .low { border-left-color: #5bc0de; }
    .slow-traces { margin-top: 20px; }
    .trace { background: #fff; padding: 10px; margin-bottom: 5px; border-left: 4px solid #5bc0de; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Performance Report</h1>
  <p>Generated on: ${report.timestamp}</p>
  
  <h2>Summary</h2>
  <div class="summary">
    <div class="metric"><strong>Request Count:</strong> ${report.summary.requestCount}</div>
    <div class="metric"><strong>Average Response Time:</strong> ${report.summary.averageResponseTime.toFixed(2)} ms</div>
    <div class="metric"><strong>P95 Response Time:</strong> ${report.summary.p95ResponseTime.toFixed(2)} ms</div>
    <div class="metric"><strong>Error Rate:</strong> ${report.summary.errorRate.toFixed(2)}%</div>
    <div class="metric"><strong>Memory Usage:</strong> ${this._formatBytes(report.summary.memoryUsage)}</div>
  </div>
  
  <h2>Slow Endpoints</h2>
  <table>
    <tr>
      <th>Endpoint</th>
      <th>Average Time (ms)</th>
      <th>Request Count</th>
    </tr>
    ${report.summary.slowestEndpoints.map(endpoint => `
    <tr>
      <td>${endpoint.endpoint}</td>
      <td>${endpoint.averageTime.toFixed(2)}</td>
      <td>${endpoint.requestCount}</td>
    </tr>
    `).join('')}
  </table>
  
  <h2>Recommendations</h2>
  <div class="recommendations">
    ${report.recommendations.map(rec => `
    <div class="recommendation ${rec.severity}">
      <h3>${rec.description}</h3>
      <p>${rec.details}</p>
    </div>
    `).join('')}
  </div>
  
  <h2>Slow Traces</h2>
  <div class="slow-traces">
    ${report.slowTraces.map(trace => `
    <div class="trace">
      <div><strong>Name:</strong> ${trace.name}</div>
      <div><strong>Duration:</strong> ${trace.duration} ms</div>
      <div><strong>Threshold:</strong> ${trace.threshold} ms</div>
      <div><strong>Time:</strong> ${new Date(trace.startTime).toISOString()}</div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;
  }
}

/**
 * Memory-based storage for performance metrics
 */
class MemoryStorage {
  constructor() {
    this.metrics = [];
    this.traces = [];
    this.slowTraces = [];
    
    // Limit storage size
    this.metricsLimit = 1000;
    this.tracesLimit = 1000;
    this.slowTracesLimit = 100;
  }
  
  /**
   * Save metrics
   * @param {Object} metrics - Metrics to save
   * @returns {Promise<Object>} Saved metrics
   */
  async saveMetrics(metrics) {
    this.metrics.push(metrics);
    
    // Limit metrics storage
    if (this.metrics.length > this.metricsLimit) {
      this.metrics = this.metrics.slice(-this.metricsLimit);
    }
    
    return metrics;
  }
  
  /**
   * Save a trace
   * @param {Object} trace - Trace to save
   * @returns {Promise<Object>} Saved trace
   */
  async saveTrace(trace) {
    this.traces.push(trace);
    
    // Limit trace storage
    if (this.traces.length > this.tracesLimit) {
      this.traces = this.traces.slice(-this.tracesLimit);
    }
    
    return trace;
  }
  
  /**
   * Save a slow trace
   * @param {Object} trace - Slow trace to save
   * @returns {Promise<Object>} Saved slow trace
   */
  async saveSlowTrace(trace) {
    this.slowTraces.push(trace);
    
    // Limit slow trace storage
    if (this.slowTraces.length > this.slowTracesLimit) {
      this.slowTraces = this.slowTraces.slice(-this.slowTracesLimit);
    }
    
    return trace;
  }
  
  /**
   * Get metrics for a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Promise<Array>} Metrics in the time range
   */
  async getMetrics(startTime, endTime) {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }
  
  /**
   * Get traces for a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Promise<Array>} Traces in the time range
   */
  async getTraces(startTime, endTime) {
    return this.traces.filter(t => t.startTime >= startTime && t.startTime <= endTime);
  }
  
  /**
   * Get slow traces for a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Promise<Array>} Slow traces in the time range
   */
  async getSlowTraces(startTime, endTime) {
    return this.slowTraces.filter(t => t.startTime >= startTime && t.startTime <= endTime);
  }
}

module.exports = {
  PerformanceMonitor,
  MemoryStorage
};