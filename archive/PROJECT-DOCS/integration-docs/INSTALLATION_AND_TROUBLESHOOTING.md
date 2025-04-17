# Installation and Troubleshooting Guide

This guide provides detailed instructions for installing, configuring, and troubleshooting the integration between the IDE Project Starter and Documentation System.

## Table of Contents

1. [Installation Requirements](#installation-requirements)
2. [Installation Process](#installation-process)
3. [Configuration](#configuration)
4. [Verification](#verification)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Debugging Techniques](#debugging-techniques)
7. [Performance Optimization](#performance-optimization)
8. [Upgrading](#upgrading)
9. [Backup and Recovery](#backup-and-recovery)
10. [FAQ](#faq)

## Installation Requirements

### System Requirements

- **Operating System**: Linux (Ubuntu 22.04+), macOS (12+), or Windows 10/11 with WSL2
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: Minimum 1GB free space, recommended 5GB+
- **CPU**: 2+ cores recommended

### Software Prerequisites

- **Node.js**: Version 20.x or later
  - Installation: `nvm install 20`
  - Verification: `node -v`

- **PostgreSQL**: Version 15.x or later
  - Installation: `sudo apt install postgresql-15`
  - Verification: `psql --version`

- **Redis**: Version 6.x or later
  - Installation: `sudo apt install redis-server`
  - Verification: `redis-cli ping` (should return "PONG")

- **Git**: Latest version
  - Installation: `sudo apt install git`
  - Verification: `git --version`

### Access Requirements

- Access to both the IDE Project Starter and Documentation System repositories
- API keys with appropriate permissions for both systems
- Database credentials for creating integration tables

## Installation Process

### 1. Clone the Integration Repository

```bash
# Clone the repository
git clone https://github.com/organization/ide-docs-integration.git

# Navigate to the project directory
cd ide-docs-integration
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install development dependencies
npm install -D typescript @types/node
```

### 3. Set Up the Database

```bash
# Create the database
sudo -u postgres createdb ide_docs_integration

# Create a database user
sudo -u postgres createuser --pwprompt integration_user

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ide_docs_integration TO integration_user;"

# Run database migrations
npm run migrate
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit the environment file with your settings
nano .env
```

Example .env file:

```
# Database Configuration
DATABASE_URL=postgresql://integration_user:password@localhost:5432/ide_docs_integration
REDIS_URL=redis://localhost:6379

# API Connections
IDE_API_URL=https://ide-system.organization.com/api
DOCS_API_URL=https://docs-system.organization.com/api
IDE_API_KEY=your_ide_api_key
DOCS_API_KEY=your_docs_api_key

# Authentication
JWT_SECRET=your_shared_jwt_secret
AUTH_TOKEN_EXPIRY=86400
REFRESH_TOKEN_EXPIRY=604800

# Feature Flags
ENABLE_REALTIME_COLLABORATION=true
ENABLE_VISUAL_CHANGELOG=true
ENABLE_DOC_HEALTH_SCORE=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 5. Build the Application

```bash
# Build for production
npm run build

# Or build in development mode with watching
npm run build:dev
```

### 6. Start the Services

```bash
# Start all services (API server and UI)
npm run start

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

## Configuration

### System Configuration

The integration is configured through the `.env` file and `config.js` files located in the project root. Key configuration areas include:

#### API Connections

Configure how the integration connects to both the IDE Project Starter and Documentation System:

```js
// config/api.js
module.exports = {
  ide: {
    baseUrl: process.env.IDE_API_URL,
    apiKey: process.env.IDE_API_KEY,
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },
  docs: {
    baseUrl: process.env.DOCS_API_URL,
    apiKey: process.env.DOCS_API_KEY,
    timeout: 30000,
    retryAttempts: 3
  }
};
```

#### Event System Configuration

Configure the event bus for cross-system communication:

```js
// config/events.js
module.exports = {
  redis: {
    url: process.env.REDIS_URL,
    prefix: 'integration:events:',
    retryStrategy: (times) => Math.min(times * 50, 2000)
  },
  eventTypes: {
    // IDE events
    'code.commit': true,
    'code.pull-request.merged': true,
    'research.completed': true,
    'research.milestone': true,
    // Docs events
    'document.version.created': true,
    'document.published': true,
    // Integration events
    'integration.project.created': true,
    'integration.project.updated': true
  }
};
```

#### Feature Flag Configuration

Enable or disable specific features through the configuration:

```js
// config/features.js
module.exports = {
  realTimeCollaboration: process.env.ENABLE_REALTIME_COLLABORATION === 'true',
  visualChangelog: process.env.ENABLE_VISUAL_CHANGELOG === 'true',
  documentHealthScore: process.env.ENABLE_DOC_HEALTH_SCORE === 'true',
  intelligentSearch: process.env.ENABLE_INTELLIGENT_SEARCH === 'true'
};
```

### Performance Configuration

Tune performance-related settings:

```js
// config/performance.js
module.exports = {
  cache: {
    enabled: true,
    ttl: 60 * 5, // 5 minutes
    maxItems: 1000
  },
  batchSize: 50, // Maximum items to process in a batch
  timeout: 60000, // Global timeout for long-running operations
  parallelism: 5 // Maximum parallel operations
};
```

## Verification

After installation, verify the integration is working correctly using these steps:

### 1. API Connection Verification

```bash
# Test IDE Project Starter connection
npm run verify:ide-connection

# Test Documentation System connection
npm run verify:docs-connection
```

### 2. Data Synchronization Verification

```bash
# Verify project synchronization
npm run verify:project-sync -- --project-id=123

# Verify user synchronization
npm run verify:user-sync -- --user-id=456
```

### 3. Event System Verification

```bash
# Publish test event and verify it's received
npm run verify:events
```

### 4. Feature Verification

Use the provided verification scripts to test each integration feature:

```bash
# Verify real-time collaboration
npm run verify:feature -- --feature=collaboration

# Verify visual changelog
npm run verify:feature -- --feature=changelog

# Verify document health score
npm run verify:feature -- --feature=health-score
```

### 5. End-to-End Workflow Verification

```bash
# Verify complete research-to-documentation workflow
npm run verify:workflow -- --workflow=research-to-docs
```

## Common Issues and Solutions

### Database Connection Issues

**Issue**: Unable to connect to PostgreSQL database.

**Solutions**:
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check database credentials in `.env` file
3. Ensure database exists: `sudo -u postgres psql -c "\l"`
4. Check network access if using a remote database
5. Verify the database user has appropriate permissions

### API Connection Issues

**Issue**: Cannot connect to IDE Project Starter or Documentation System APIs.

**Solutions**:
1. Verify API URLs in configuration
2. Check API keys for validity and permissions
3. Verify network connectivity to API endpoints
4. Check for any rate limiting or IP restrictions
5. Look for TLS/SSL certificate issues with HTTPS connections

### Event System Issues

**Issue**: Events not propagating between systems.

**Solutions**:
1. Verify Redis is running: `redis-cli ping`
2. Check Redis connection URL in `.env`
3. Monitor Redis events: `redis-cli subscribe "integration:events:*"`
4. Restart the event service: `npm run restart:events`
5. Check for error logs related to event processing

### Authentication Issues

**Issue**: Users cannot authenticate across systems.

**Solutions**:
1. Verify JWT_SECRET is identical in both systems
2. Check token expiry settings
3. Validate that user IDs are consistent across systems
4. Clear Redis session cache: `redis-cli flushdb`
5. Ensure the authentication service is running

## Debugging Techniques

### Log Analysis

Access comprehensive logs to identify issues:

```bash
# View server logs
npm run logs:server

# View event system logs
npm run logs:events

# View specific feature logs
npm run logs:feature -- --feature=visual-changelog
```

Log files are stored in the `logs/` directory, organized by date and service.

### Diagnostic Tools

The integration includes several built-in diagnostic tools:

```bash
# Run API diagnostics
npm run diagnostics:api

# Run database diagnostics
npm run diagnostics:db

# Run event system diagnostics
npm run diagnostics:events

# Generate comprehensive diagnostic report
npm run diagnostics:all > diagnostic_report.txt
```

### Debug Mode

Enable debug mode for more verbose logging:

```bash
# Start the server in debug mode
DEBUG=integration:* npm run start

# Enable specific debug categories
DEBUG=integration:events,integration:api npm run start
```

### Monitoring Dashboard

Access the monitoring dashboard for real-time insights:

```bash
# Start the monitoring dashboard
npm run monitoring

# Access at http://localhost:8090
```

## Performance Optimization

### Caching Strategy

The integration uses multi-level caching:

1. **Memory Cache**: First-level cache for frequently accessed data
2. **Redis Cache**: Distributed cache for shared data across instances
3. **Database Query Cache**: Optimized queries with result caching

Configure cache settings in `config/cache.js`:

```js
// config/cache.js
module.exports = {
  memory: {
    enabled: true,
    ttl: 60, // 1 minute
    maxItems: 1000
  },
  redis: {
    enabled: true,
    ttl: 300, // 5 minutes
    prefix: 'integration:cache:'
  },
  query: {
    enabled: true,
    ttl: 60, // 1 minute
  }
};
```

### Database Optimization

Optimize database performance with these tools:

```bash
# Analyze database indexes
npm run db:analyze-indexes

# Optimize database queries
npm run db:optimize-queries

# Run database vacuum to reclaim space
npm run db:vacuum
```

### Load Testing

Before deploying to production, run load tests:

```bash
# Run basic load test
npm run test:load

# Run specific feature load test
npm run test:load -- --feature=changelog

# Generate load test report
npm run test:load -- --report
```

## Upgrading

Follow these steps to upgrade the integration:

```bash
# Backup current configuration
npm run backup:config

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Run database migrations
npm run migrate

# Rebuild the application
npm run build

# Restart services
npm run restart
```

## Backup and Recovery

### Creating Backups

Regularly backup your integration data:

```bash
# Backup configuration
npm run backup:config

# Backup database
npm run backup:db

# Backup all integration data
npm run backup:all
```

Backups are stored in the `backups/` directory with timestamped filenames.

### Recovery

Restore from backups when needed:

```bash
# List available backups
npm run backup:list

# Restore configuration
npm run backup:restore-config -- --backup=20250417_123045

# Restore database
npm run backup:restore-db -- --backup=20250417_123045

# Restore everything
npm run backup:restore-all -- --backup=20250417_123045
```

## FAQ

### How do I add a new integration feature?

New features should follow the integration architecture pattern:

1. Add feature flag in `config/features.js`
2. Create service implementation in `src/services/`
3. Add API endpoints in `src/api/routes/`
4. Implement UI components in `src/ui/components/`
5. Update event handlers if needed in `src/events/`
6. Add feature verification tests

### How do I troubleshoot slow performance?

1. Enable the performance monitoring: `npm run monitoring`
2. Check database query performance: `npm run diagnostics:db-performance`
3. Look for event processing bottlenecks: `npm run diagnostics:events-performance`
4. Analyze API response times: `npm run diagnostics:api-performance`
5. Consider scaling Redis or database resources

### How do I connect to external systems?

The integration can connect to additional systems by:

1. Adding configuration in `config/external-systems.js`
2. Implementing API client in `src/clients/`
3. Creating event mappings in `src/events/mappings/`
4. Adding authorization in `src/auth/external-systems.js`

### Can I run multiple instances of the integration?

Yes, the integration is designed to scale horizontally:

1. Ensure all instances share the same Redis instance
2. Configure a load balancer in front of API instances
3. Use sticky sessions for WebSocket connections
4. Ensure database connections are properly pooled

### How do I customize the integration UI?

The UI can be customized by:

1. Modifying theme settings in `src/ui/theme.js`
2. Customizing components in `src/ui/components/`
3. Updating layouts in `src/ui/layouts/`
4. Adding custom CSS in `src/ui/styles/custom.css`

## Additional Resources

- [Integration Architecture Documentation](./architecture/SYSTEM_ARCHITECTURE.md)
- [API Documentation](./api-docs/README.md)
- [Event System Documentation](./event-docs/README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Release Notes](./CHANGELOG.md)

For additional support, contact the integration team or raise an issue in the GitHub repository.