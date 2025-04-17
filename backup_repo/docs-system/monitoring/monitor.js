/**
 * Monitoring and Alerting Module for Documentation System
 * 
 * This module provides monitoring, metrics collection, and alerting capabilities
 * to ensure system health and performance.
 */

const EventEmitter = require('events');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Central event bus for monitoring events
const monitorEvents = new EventEmitter();

// Default thresholds for alerts
const DEFAULT_THRESHOLDS = {
  cpu: 80, // CPU usage percentage
  memory: 80, // Memory usage percentage
  disk: 80, // Disk usage percentage
  responseTime: 1000, // Response time in ms
  errorRate: 5, // Error rate percentage
  concurrentUsers: 100 // Max concurrent users
};

// Monitoring state
const monitoringState = {
  isEnabled: false,
  metrics: {},
  thresholds: { ...DEFAULT_THRESHOLDS },
  alertHandlers: [],
  metricsHistory: [],
  historyLimit: 1000, // Limit number of historical metrics to store
  startTime: null,
  lastCheck: null,
  checkInterval: 60000, // 1 minute
  checkIntervalId: null
};

/**
 * Monitoring class for system health and performance
 */
class Monitor {
  /**
   * Initialize the monitoring system
   * @param {Object} [options] - Configuration options
   * @param {Object} [options.thresholds] - Alert thresholds
   * @param {number} [options.checkInterval] - Check interval in ms
   * @param {number} [options.historyLimit] - Limit of metrics history
   * @param {Array} [options.alertHandlers] - Alert handler functions
   * @returns {Object} Monitoring instance
   */
  static initialize(options = {}) {
    // Stop existing monitoring if running
    if (monitoringState.isEnabled) {
      Monitor.stop();
    }
    
    // Set configuration
    if (options.thresholds) {
      monitoringState.thresholds = {
        ...DEFAULT_THRESHOLDS,
        ...options.thresholds
      };
    }
    
    if (options.checkInterval) {
      monitoringState.checkInterval = options.checkInterval;
    }
    
    if (options.historyLimit) {
      monitoringState.historyLimit = options.historyLimit;
    }
    
    if (options.alertHandlers && Array.isArray(options.alertHandlers)) {
      monitoringState.alertHandlers = [...options.alertHandlers];
    }
    
    // Initialize metrics
    monitoringState.metrics = {
      system: {
        cpu: 0,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        },
        uptime: os.uptime()
      },
      application: {
        status: 'starting',
        responseTime: {
          avg: 0,
          min: 0,
          max: 0,
          p95: 0
        },
        requests: {
          total: 0,
          success: 0,
          error: 0,
          errorRate: 0
        },
        users: {
          concurrent: 0,
          total: 0
        }
      },
      custom: {}
    };
    
    // Start monitoring
    monitoringState.startTime = Date.now();
    monitoringState.lastCheck = Date.now();
    monitoringState.isEnabled = true;
    
    // Set up regular checks
    monitoringState.checkIntervalId = setInterval(() => {
      Monitor.check();
    }, monitoringState.checkInterval);
    
    console.log(`Monitoring initialized with check interval of ${monitoringState.checkInterval}ms`);
    
    return Monitor;
  }
  
  /**
   * Stop the monitoring system
   */
  static stop() {
    if (monitoringState.checkIntervalId) {
      clearInterval(monitoringState.checkIntervalId);
      monitoringState.checkIntervalId = null;
    }
    
    monitoringState.isEnabled = false;
    console.log('Monitoring stopped');
  }
  
  /**
   * Perform a system health check
   */
  static check() {
    if (!monitoringState.isEnabled) {
      return;
    }
    
    const now = Date.now();
    monitoringState.lastCheck = now;
    
    // Update system metrics
    const cpuUsage = Monitor.getCpuUsage();
    
    monitoringState.metrics.system = {
      cpu: cpuUsage,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      uptime: os.uptime()
    };
    
    // Check for threshold violations
    Monitor.checkThresholds();
    
    // Store historical metrics
    Monitor.storeMetricsHistory();
    
    // Emit check event
    monitorEvents.emit('check', monitoringState.metrics);
  }
  
  /**
   * Get current CPU usage
   * @returns {number} CPU usage percentage
   */
  static getCpuUsage() {
    // Simple estimate of CPU usage
    // In production, you would use a more accurate method
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }
    
    const usagePercentage = 100 - (totalIdle / totalTick) * 100;
    return Math.floor(usagePercentage);
  }
  
  /**
   * Check thresholds and trigger alerts if needed
   */
  static checkThresholds() {
    const { metrics, thresholds } = monitoringState;
    
    // CPU threshold
    if (metrics.system.cpu > thresholds.cpu) {
      Monitor.triggerAlert({
        type: 'threshold_violation',
        level: 'warning',
        source: 'system',
        metric: 'cpu',
        value: metrics.system.cpu,
        threshold: thresholds.cpu,
        message: `CPU usage is high: ${metrics.system.cpu}% (threshold: ${thresholds.cpu}%)`
      });
    }
    
    // Memory threshold
    if (metrics.system.memory.usagePercentage > thresholds.memory) {
      Monitor.triggerAlert({
        type: 'threshold_violation',
        level: 'warning',
        source: 'system',
        metric: 'memory',
        value: metrics.system.memory.usagePercentage,
        threshold: thresholds.memory,
        message: `Memory usage is high: ${metrics.system.memory.usagePercentage.toFixed(2)}% (threshold: ${thresholds.memory}%)`
      });
    }
    
    // Response time threshold
    if (metrics.application.responseTime.avg > thresholds.responseTime) {
      Monitor.triggerAlert({
        type: 'threshold_violation',
        level: 'warning',
        source: 'application',
        metric: 'responseTime',
        value: metrics.application.responseTime.avg,
        threshold: thresholds.responseTime,
        message: `Average response time is high: ${metrics.application.responseTime.avg}ms (threshold: ${thresholds.responseTime}ms)`
      });
    }
    
    // Error rate threshold
    if (metrics.application.requests.errorRate > thresholds.errorRate) {
      Monitor.triggerAlert({
        type: 'threshold_violation',
        level: 'error',
        source: 'application',
        metric: 'errorRate',
        value: metrics.application.requests.errorRate,
        threshold: thresholds.errorRate,
        message: `Error rate is high: ${metrics.application.requests.errorRate.toFixed(2)}% (threshold: ${thresholds.errorRate}%)`
      });
    }
    
    // Concurrent users threshold
    if (metrics.application.users.concurrent > thresholds.concurrentUsers) {
      Monitor.triggerAlert({
        type: 'threshold_violation',
        level: 'warning',
        source: 'application',
        metric: 'concurrentUsers',
        value: metrics.application.users.concurrent,
        threshold: thresholds.concurrentUsers,
        message: `High number of concurrent users: ${metrics.application.users.concurrent} (threshold: ${thresholds.concurrentUsers})`
      });
    }
  }
  
  /**
   * Store current metrics in history
   */
  static storeMetricsHistory() {
    // Add timestamp to metrics
    const metricsWithTimestamp = {
      timestamp: Date.now(),
      ...monitoringState.metrics
    };
    
    // Add to history
    monitoringState.metricsHistory.push(metricsWithTimestamp);
    
    // Trim history if needed
    if (monitoringState.metricsHistory.length > monitoringState.historyLimit) {
      monitoringState.metricsHistory.shift();
    }
  }
  
  /**
   * Trigger an alert
   * @param {Object} alert - Alert data
   */
  static triggerAlert(alert) {
    // Add timestamp
    const alertWithTimestamp = {
      timestamp: Date.now(),
      ...alert
    };
    
    // Log the alert
    console.warn(`ALERT: ${alert.message}`);
    
    // Emit alert event
    monitorEvents.emit('alert', alertWithTimestamp);
    
    // Call alert handlers
    for (const handler of monitoringState.alertHandlers) {
      try {
        handler(alertWithTimestamp);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    }
  }
  
  /**
   * Register an alert handler
   * @param {Function} handler - Alert handler function
   */
  static onAlert(handler) {
    if (typeof handler === 'function') {
      monitoringState.alertHandlers.push(handler);
    }
  }
  
  /**
   * Remove an alert handler
   * @param {Function} handler - Alert handler function to remove
   */
  static offAlert(handler) {
    const index = monitoringState.alertHandlers.indexOf(handler);
    if (index !== -1) {
      monitoringState.alertHandlers.splice(index, 1);
    }
  }
  
  /**
   * Get current metrics
   * @returns {Object} Current metrics
   */
  static getMetrics() {
    return { ...monitoringState.metrics };
  }
  
  /**
   * Get historical metrics
   * @param {number} [limit] - Maximum number of records to return
   * @returns {Array} Historical metrics
   */
  static getHistory(limit) {
    if (limit && limit > 0) {
      return monitoringState.metricsHistory.slice(-limit);
    }
    return [...monitoringState.metricsHistory];
  }
  
  /**
   * Track a request
   * @param {boolean} success - Whether the request was successful
   * @param {number} responseTime - Response time in ms
   */
  static trackRequest(success, responseTime) {
    if (!monitoringState.isEnabled) {
      return;
    }
    
    const metrics = monitoringState.metrics.application;
    
    // Update request counts
    metrics.requests.total += 1;
    if (success) {
      metrics.requests.success += 1;
    } else {
      metrics.requests.error += 1;
    }
    
    // Update error rate
    metrics.requests.errorRate = (metrics.requests.error / metrics.requests.total) * 100;
    
    // Update response time
    if (responseTime !== undefined) {
      const times = metrics.responseTime;
      if (times.avg === 0) {
        times.avg = responseTime;
        times.min = responseTime;
        times.max = responseTime;
        times.p95 = responseTime;
      } else {
        // Simple rolling average
        times.avg = (times.avg * 0.95) + (responseTime * 0.05);
        times.min = Math.min(times.min, responseTime);
        times.max = Math.max(times.max, responseTime);
        
        // Approximate p95 (in production, use a more accurate method)
        if (responseTime > times.p95) {
          times.p95 = (times.p95 * 0.95) + (responseTime * 0.05);
        }
      }
    }
    
    // Emit request event
    monitorEvents.emit('request', {
      success,
      responseTime,
      metrics: metrics.requests
    });
  }
  
  /**
   * Track user activity
   * @param {string} action - Activity action ('login', 'logout', or 'active')
   * @param {string} userId - User identifier
   */
  static trackUser(action, userId) {
    if (!monitoringState.isEnabled) {
      return;
    }
    
    const metrics = monitoringState.metrics.application.users;
    
    switch (action) {
      case 'login':
        metrics.concurrent += 1;
        metrics.total += 1;
        break;
      case 'logout':
        metrics.concurrent = Math.max(0, metrics.concurrent - 1);
        break;
      case 'active':
        // Just track activity, no change in metrics
        break;
      default:
        console.warn(`Unknown user action: ${action}`);
    }
    
    // Emit user event
    monitorEvents.emit('user', {
      action,
      userId,
      concurrent: metrics.concurrent,
      total: metrics.total
    });
  }
  
  /**
   * Set application status
   * @param {string} status - Application status
   */
  static setStatus(status) {
    if (!monitoringState.isEnabled) {
      return;
    }
    
    const oldStatus = monitoringState.metrics.application.status;
    monitoringState.metrics.application.status = status;
    
    // Emit status change event
    monitorEvents.emit('status', {
      oldStatus,
      newStatus: status
    });
    
    // If status changed to error, trigger an alert
    if (status === 'error' && oldStatus !== 'error') {
      Monitor.triggerAlert({
        type: 'status_change',
        level: 'error',
        source: 'application',
        oldStatus,
        newStatus: status,
        message: 'Application status changed to error'
      });
    }
  }
  
  /**
   * Set a custom metric
   * @param {string} name - Metric name
   * @param {*} value - Metric value
   */
  static setCustomMetric(name, value) {
    if (!monitoringState.isEnabled) {
      return;
    }
    
    monitoringState.metrics.custom[name] = value;
    
    // Emit custom metric event
    monitorEvents.emit('customMetric', {
      name,
      value
    });
  }
  
  /**
   * Get the event emitter for monitoring events
   * @returns {EventEmitter} Event emitter
   */
  static events() {
    return monitorEvents;
  }
  
  /**
   * Create a request middleware for Express.js
   * @returns {Function} Express middleware function
   */
  static requestMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Track response
      const trackResponse = () => {
        const responseTime = Date.now() - startTime;
        const success = res.statusCode < 400;
        Monitor.trackRequest(success, responseTime);
      };
      
      // Track after response is sent
      res.on('finish', trackResponse);
      
      next();
    };
  }
  
  /**
   * Create a middleware to track user activity for Express.js
   * @returns {Function} Express middleware function
   */
  static userMiddleware() {
    return (req, res, next) => {
      if (req.user && req.user.id) {
        Monitor.trackUser('active', req.user.id);
      }
      next();
    };
  }
  
  /**
   * Export metrics to a file
   * @param {string} filePath - File path to export to
   * @returns {Promise<void>} Promise that resolves when export is complete
   */
  static exportMetrics(filePath) {
    return new Promise((resolve, reject) => {
      const metrics = {
        timestamp: Date.now(),
        system: monitoringState.metrics.system,
        application: monitoringState.metrics.application,
        custom: monitoringState.metrics.custom
      };
      
      const metricsJson = JSON.stringify(metrics, null, 2);
      
      fs.writeFile(filePath, metricsJson, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Monitor;