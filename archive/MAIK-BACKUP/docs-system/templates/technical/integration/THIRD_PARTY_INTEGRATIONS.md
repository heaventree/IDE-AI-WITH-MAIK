# Third-Party Integrations

## Overview

This document outlines the standards, architecture, and best practices for third-party integrations in {{PROJECT_NAME}}. It serves as a guide for implementing, maintaining, and monitoring external service integrations.

## Integration Architecture

### Integration Principles

1. **Loose Coupling**: Minimize dependencies between the application and third-party services
2. **Resilience**: Design integrations to handle failures gracefully
3. **Abstraction**: Abstract third-party APIs behind internal interfaces
4. **Security**: Protect credentials and sensitive data across integration points
5. **Observability**: Monitor and log integration health and performance
6. **Testability**: Design integrations to be testable without live third-party dependencies
7. **Standardization**: Use consistent patterns across different integrations

### Integration Patterns

The following integration patterns are used:

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **API Client** | REST/GraphQL APIs | {{API_CLIENT_IMPLEMENTATION}} |
| **Webhook Receiver** | Event notifications | {{WEBHOOK_IMPLEMENTATION}} |
| **Message Queue** | Asynchronous processing | {{MESSAGE_QUEUE_IMPLEMENTATION}} |
| **OAuth Flow** | Authentication delegation | {{OAUTH_IMPLEMENTATION}} |
| **SDK Wrapper** | Vendor SDKs | {{SDK_WRAPPER_IMPLEMENTATION}} |
| **ETL Process** | Data synchronization | {{ETL_IMPLEMENTATION}} |

### Integration Layer Architecture

```
+-----------------------+
| Application Services  |
+-----------------------+
           |
+------------------------+
| Integration Interfaces |
+------------------------+
           |
+------------------------+
|  Integration Adapters  |
+------------------------+
           |
+------------------------+
|   Resilience Layer     |
+------------------------+
           |
+------------------------+
|  External Services     |
+------------------------+
```

## Core Integrations

### {{INTEGRATION_1_NAME}}

**Purpose**: {{INTEGRATION_1_PURPOSE}}  
**Integration Type**: {{INTEGRATION_1_TYPE}}  
**Data Flow**: {{INTEGRATION_1_DATA_FLOW}}  
**Authentication Method**: {{INTEGRATION_1_AUTH}}  

#### Configuration

```json
{
  "apiKey": "{{INTEGRATION_1_API_KEY_VAR}}",
  "baseUrl": "{{INTEGRATION_1_BASE_URL_VAR}}",
  "timeout": "{{INTEGRATION_1_TIMEOUT_VAR}}",
  "webhookSecret": "{{INTEGRATION_1_WEBHOOK_SECRET_VAR}}"
}
```

#### Implementation Details

- **Client Library**: {{INTEGRATION_1_CLIENT_LIBRARY}}
- **Rate Limits**: {{INTEGRATION_1_RATE_LIMITS}}
- **Retry Strategy**: {{INTEGRATION_1_RETRY_STRATEGY}}
- **Timeout Handling**: {{INTEGRATION_1_TIMEOUT_HANDLING}}

#### Example Usage

```javascript
// Example integration usage (pseudo-code)
const client = new Integration1Client({
  apiKey: config.get('integration1.apiKey'),
  baseUrl: config.get('integration1.baseUrl')
});

async function processItem(itemId) {
  try {
    const result = await client.getItem(itemId);
    return transformResponse(result);
  } catch (error) {
    if (error.isRateLimitError) {
      await sleep(error.retryAfter);
      return processItem(itemId);
    }
    throw new ApplicationError('Failed to process item', { cause: error });
  }
}
```

### {{INTEGRATION_2_NAME}}

**Purpose**: {{INTEGRATION_2_PURPOSE}}  
**Integration Type**: {{INTEGRATION_2_TYPE}}  
**Data Flow**: {{INTEGRATION_2_DATA_FLOW}}  
**Authentication Method**: {{INTEGRATION_2_AUTH}}  

#### Configuration

```json
{
  "clientId": "{{INTEGRATION_2_CLIENT_ID_VAR}}",
  "clientSecret": "{{INTEGRATION_2_CLIENT_SECRET_VAR}}",
  "scopes": "{{INTEGRATION_2_SCOPES_VAR}}",
  "redirectUri": "{{INTEGRATION_2_REDIRECT_URI_VAR}}"
}
```

#### Implementation Details

- **Client Library**: {{INTEGRATION_2_CLIENT_LIBRARY}}
- **Rate Limits**: {{INTEGRATION_2_RATE_LIMITS}}
- **Retry Strategy**: {{INTEGRATION_2_RETRY_STRATEGY}}
- **Timeout Handling**: {{INTEGRATION_2_TIMEOUT_HANDLING}}

#### Example Usage

```javascript
// Example integration usage (pseudo-code)
const client = new Integration2Client({
  clientId: config.get('integration2.clientId'),
  clientSecret: config.get('integration2.clientSecret')
});

async function authenticateUser(code) {
  try {
    const tokens = await client.exchangeCode(code);
    const userData = await client.getUserInfo(tokens.accessToken);
    return {
      externalId: userData.id,
      email: userData.email,
      tokens: {
        access: tokens.accessToken,
        refresh: tokens.refreshToken,
        expires: tokens.expiresAt
      }
    };
  } catch (error) {
    logger.error('Authentication failed', { error });
    throw new AuthenticationError('Failed to authenticate with service');
  }
}
```

## Integration Standards

### Error Handling

All integrations should implement the following error handling approach:

1. **Categorize Errors**:
   - Connection errors (network issues)
   - Authentication errors (invalid credentials)
   - Authorization errors (insufficient permissions)
   - Validation errors (invalid input)
   - Resource errors (not found, conflict)
   - Rate limiting errors
   - Server errors (internal service errors)

2. **Standardized Error Objects**:

```javascript
class IntegrationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = options.cause;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.retryable = options.retryable ?? false;
    this.retryAfter = options.retryAfter;
    this.context = options.context || {};
  }
}

class ConnectionError extends IntegrationError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'CONNECTION_ERROR', retryable: true });
  }
}

// Additional error classes for each category
```

3. **Error Mapping**:

```javascript
function mapApiErrorToIntegrationError(apiError) {
  if (apiError.status === 401) {
    return new AuthenticationError('Invalid credentials', {
      cause: apiError,
      context: { response: apiError.response }
    });
  }
  // Map other error types
}
```

### Retry Mechanisms

Integrations should implement resilient retry mechanisms:

```javascript
async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 300,
    factor = 2,
    jitter = true,
    retryableErrors = [ConnectionError, RateLimitError]
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable = retryableErrors.some(ErrorClass => error instanceof ErrorClass) || error.retryable;
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      lastError = error;
      
      let delay = error.retryAfter || baseDelay * Math.pow(factor, attempt);
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}
```

### Circuit Breakers

Implement circuit breakers to prevent cascading failures:

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.monitorInterval = options.monitorInterval || 5000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.monitors = new Set();
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.lastFailureTime + this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.notifyMonitors();
  }
  
  onFailure(error) {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
    
    this.notifyMonitors();
  }
  
  // Additional circuit breaker methods
}
```

### Webhook Handling

For webhook integrations, follow these guidelines:

1. **Signature Verification**:

```javascript
function verifyWebhookSignature(request, secret) {
  const signature = request.headers['x-webhook-signature'];
  const payload = request.body;
  
  const expectedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  if (!timingSafeEqual(signature, expectedSignature)) {
    throw new Error('Invalid webhook signature');
  }
}
```

2. **Idempotency**:

```javascript
async function processWebhook(event) {
  const eventId = event.id;
  
  // Check if event has already been processed
  const existing = await db.webhookEvents.findOne({ eventId });
  if (existing) {
    logger.info('Duplicate webhook event', { eventId });
    return { status: 'already_processed' };
  }
  
  // Process the event
  const result = await processEvent(event);
  
  // Record the event
  await db.webhookEvents.create({
    eventId,
    type: event.type,
    processed: true,
    processedAt: new Date(),
    result
  });
  
  return result;
}
```

## Credentials Management

### Secure Storage

Credentials must be stored securely:

- Use environment variables or secure secret management
- Never commit credentials to source control
- Encrypt sensitive credentials in the database
- Rotate credentials regularly

### Token Renewal

For OAuth tokens, implement automatic renewal:

```javascript
class TokenManager {
  constructor(client, options = {}) {
    this.client = client;
    this.tokens = null;
    this.refreshThreshold = options.refreshThreshold || 300; // 5 minutes in seconds
  }
  
  async getAccessToken() {
    if (!this.tokens) {
      this.tokens = await this.loadTokens();
    }
    
    if (this.shouldRefresh()) {
      await this.refreshTokens();
    }
    
    return this.tokens.accessToken;
  }
  
  shouldRefresh() {
    if (!this.tokens) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return this.tokens.expiresAt - now < this.refreshThreshold;
  }
  
  async refreshTokens() {
    try {
      const newTokens = await this.client.refreshToken(this.tokens.refreshToken);
      this.tokens = newTokens;
      await this.saveTokens(newTokens);
    } catch (error) {
      this.tokens = null;
      throw new AuthenticationError('Failed to refresh tokens', { cause: error });
    }
  }
  
  // Additional token management methods
}
```

## Testing Strategies

### Mocking External Services

For unit and integration tests, mock external services:

```javascript
// Example test with mocked service (pseudo-code)
test('should process payment successfully', async () => {
  // Arrange
  const mockPaymentService = {
    createCharge: jest.fn().mockResolvedValue({
      id: 'charge_123',
      status: 'succeeded',
      amount: 1000
    })
  };
  
  const paymentProcessor = new PaymentProcessor(mockPaymentService);
  
  // Act
  const result = await paymentProcessor.processPayment({
    amount: 10.00,
    currency: 'USD',
    source: 'card_token'
  });
  
  // Assert
  expect(mockPaymentService.createCharge).toHaveBeenCalledWith({
    amount: 1000, // Cents
    currency: 'USD',
    source: 'card_token'
  });
  
  expect(result).toEqual({
    successful: true,
    transactionId: 'charge_123',
    amount: 10.00,
    currency: 'USD'
  });
});
```

### Stubbed Responses

Use recorded/stubbed responses for more realistic tests:

```javascript
// Example with stubbed responses (pseudo-code)
test('should handle API error correctly', async () => {
  // Arrange
  const errorResponse = loadFixture('payment_service/error_response.json');
  
  nock('https://api.payment-service.com')
    .post('/v1/charges')
    .reply(400, errorResponse);
  
  const paymentService = new PaymentService({
    apiKey: 'test_key',
    baseUrl: 'https://api.payment-service.com'
  });
  
  // Act & Assert
  await expect(paymentService.createCharge({
    amount: 1000,
    currency: 'USD',
    source: 'invalid_token'
  })).rejects.toThrow('Invalid card token');
});
```

### Integration Environment

For critical integrations, maintain a sandbox testing environment:

- Use provider sandboxes where available
- Create test accounts for each integration
- Document test scenarios and data
- Include integration tests in CI pipeline

## Monitoring & Observability

### Health Checks

Implement health checks for each integration:

```javascript
// Example health check (pseudo-code)
async function checkIntegrationHealth(integration) {
  try {
    const startTime = Date.now();
    await integration.performHealthCheck();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      name: integration.name,
      responseTime,
      lastChecked: new Date()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      name: integration.name,
      error: error.message,
      lastChecked: new Date()
    };
  }
}
```

### Logging

Implement structured logging for integration activities:

```javascript
// Example logging (pseudo-code)
function createIntegrationLogger(integration) {
  return {
    info(message, context = {}) {
      logger.info(message, {
        integration: integration.name,
        ...context
      });
    },
    
    error(message, error, context = {}) {
      logger.error(message, {
        integration: integration.name,
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          response: error.response
        },
        ...context
      });
    }
    
    // Additional log levels
  };
}
```

### Metrics

Collect the following metrics for each integration:

- Request count
- Success/failure rate
- Response time
- Rate limit usage
- Token expiration events
- Webhook processing time
- Circuit breaker state changes

## Rate Limiting

### Pre-emptive Rate Limiting

Implement client-side rate limiting:

```javascript
class RateLimiter {
  constructor(options = {}) {
    this.limit = options.limit || 100;
    this.interval = options.interval || 60000; // 1 minute in ms
    this.requests = [];
  }
  
  async throttle(operation) {
    await this.waitForAvailableSlot();
    
    try {
      return await operation();
    } finally {
      this.recordRequest();
    }
  }
  
  recordRequest() {
    const now = Date.now();
    this.requests.push(now);
    this.removeOldRequests(now);
  }
  
  removeOldRequests(now) {
    const cutoff = now - this.interval;
    this.requests = this.requests.filter(time => time >= cutoff);
  }
  
  async waitForAvailableSlot() {
    const now = Date.now();
    this.removeOldRequests(now);
    
    if (this.requests.length < this.limit) {
      return;
    }
    
    const oldestRequest = this.requests[0];
    const nextSlot = oldestRequest + this.interval;
    const waitTime = nextSlot - now;
    
    if (waitTime > 0) {
      await sleep(waitTime);
    }
  }
}
```

### Rate Limit Detection

Detect and handle rate limiting from external services:

```javascript
function isRateLimitError(error) {
  return (
    error.status === 429 ||
    error.code === 'RATE_LIMITED' ||
    error.message.includes('rate limit')
  );
}

function extractRetryAfter(error) {
  if (error.headers && error.headers['retry-after']) {
    const retryAfter = parseInt(error.headers['retry-after'], 10);
    if (!isNaN(retryAfter)) {
      return retryAfter * 1000; // Convert to ms
    }
  }
  
  return 60000; // Default to 1 minute
}
```

## Synchronization Strategies

### Data Sync Patterns

For integrations requiring data synchronization:

1. **Incremental Sync**:

```javascript
async function incrementalSync(resource, options = {}) {
  const lastSyncTime = await getLastSyncTime(resource);
  const newLastSyncTime = new Date();
  
  const items = await fetchItemsSince(resource, lastSyncTime);
  
  for (const item of items) {
    await processItem(item);
  }
  
  await updateLastSyncTime(resource, newLastSyncTime);
  
  return {
    resource,
    itemsProcessed: items.length,
    syncTime: newLastSyncTime
  };
}
```

2. **Pagination Handling**:

```javascript
async function fetchAllPages(fetchFunction, options = {}) {
  const {
    startPage = 1,
    pageSize = 100,
    maxPages = Infinity
  } = options;
  
  let currentPage = startPage;
  let hasMore = true;
  const allResults = [];
  
  while (hasMore && currentPage <= maxPages) {
    const pageResults = await fetchFunction({
      page: currentPage,
      pageSize
    });
    
    allResults.push(...pageResults.items);
    
    hasMore = pageResults.hasMore;
    currentPage++;
  }
  
  return allResults;
}
```

3. **Webhook-Based Sync**:

```javascript
function setupSyncWebhooks(integration, resources) {
  for (const resource of resources) {
    integration.registerWebhook({
      event: `${resource}.created`,
      handler: handleResourceCreated
    });
    
    integration.registerWebhook({
      event: `${resource}.updated`,
      handler: handleResourceUpdated
    });
    
    integration.registerWebhook({
      event: `${resource}.deleted`,
      handler: handleResourceDeleted
    });
  }
}
```

## Fallback Mechanisms

### Degraded Service Modes

Implement fallback behavior for integration failures:

```javascript
async function getProductData(productId) {
  try {
    // Try to get fresh data from integration
    return await productIntegration.getProduct(productId);
  } catch (error) {
    logger.error('Failed to get product from integration', { error, productId });
    
    // Fallback to cached data if available
    const cachedProduct = await productCache.get(productId);
    if (cachedProduct) {
      return {
        ...cachedProduct,
        fromCache: true,
        cacheTimestamp: cachedProduct.updatedAt
      };
    }
    
    // Last resort fallback to basic information from database
    const basicProduct = await db.products.findById(productId);
    if (basicProduct) {
      return {
        id: basicProduct.id,
        name: basicProduct.name,
        fromDatabase: true,
        limited: true
      };
    }
    
    // Re-throw if all fallbacks fail
    throw error;
  }
}
```

### Feature Flagging

Use feature flags to control integration availability:

```javascript
function isIntegrationEnabled(integration) {
  // Check global feature flag
  if (!featureFlags.isEnabled(`integration.${integration.name}`)) {
    return false;
  }
  
  // Check circuit breaker
  if (integration.circuitBreaker && integration.circuitBreaker.state === 'OPEN') {
    return false;
  }
  
  // Check maintenance mode
  if (maintenanceMode.isActive(integration.name)) {
    return false;
  }
  
  return true;
}
```

## Documentation Standards

### Integration Documentation Template

For each integration, maintain the following documentation:

1. **Overview**
   - Purpose and functionality
   - Data flow diagram
   - Integration type

2. **Prerequisites**
   - Account requirements
   - API credential acquisition
   - Permissions and scopes

3. **Configuration**
   - Required environment variables
   - Configuration options
   - Default values

4. **API Reference**
   - Endpoint documentation
   - Request/response formats
   - Rate limits
   - Authentication details

5. **Error Handling**
   - Common error scenarios
   - Troubleshooting steps
   - Support contacts

6. **Testing**
   - Test account information
   - Test data generation
   - Test scenarios

7. **Monitoring**
   - Health check endpoints
   - Alerting thresholds
   - Dashboard links

## References

- {{INTEGRATION_REFERENCE_1}}
- {{INTEGRATION_REFERENCE_2}}
- {{INTEGRATION_REFERENCE_3}}