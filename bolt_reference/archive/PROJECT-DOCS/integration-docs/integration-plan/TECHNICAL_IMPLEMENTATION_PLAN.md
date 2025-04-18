# Technical Implementation Plan

## Overview

This document provides detailed technical guidelines for implementing the integration between the IDE Project Starter and the Documentation System. It outlines the architecture, technologies, implementation approaches, and best practices to ensure a successful integration.

## Architecture Overview

The integration architecture follows a clean architecture approach with clear separation of concerns:

```
┌───────────────────────────────────────────────────────────────┐
│                      Presentation Layer                       │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  IDE Project    │  │ Unified         │  │ Documentation   ││
│  │  UI Components  │  │ Components      │  │ UI Components   ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│                      Application Layer                        │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  IDE Project    │  │ Integration     │  │ Documentation   ││
│  │  Services       │  │ Services        │  │ Services        ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│                       Domain Layer                            │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  IDE Project    │  │ Shared Domain   │  │ Documentation   ││
│  │  Domain         │  │ Models          │  │ Domain          ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                       │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  IDE Project    │  │ Integration     │  │ Documentation   ││
│  │  Repositories   │  │ Adapters        │  │ Repositories    ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Adapter Pattern**: Use adapters to bridge differences between the two systems
2. **Event-Driven Communication**: Implement event-based communication for loose coupling
3. **Shared Domain Models**: Define shared domain models for consistency
4. **API Contracts**: Establish clear API contracts between systems
5. **Feature Toggles**: Implement feature toggles for phased rollout

## Technical Stack

### Shared Components

- **TypeScript**: For type safety across the integration
- **React**: For UI components
- **Express**: For API integration services
- **WebSocket**: For real-time communication
- **Redis**: For distributed caching and pub/sub
- **PostgreSQL**: For shared data storage

### Integration Technologies

- **API Gateway**: To route requests between systems
- **Event Bus**: For cross-system event propagation
- **Shared Authentication**: OAuth 2.0 with JWT tokens
- **GraphQL Federation**: For unified data queries (optional)

## Implementation Approach

### 1. Foundation Layer Implementation

#### Shared Authentication

```typescript
// integration/auth/shared-auth.service.ts

import { AuthService as IDEAuthService } from 'ide-project/auth';
import { AuthService as DocsAuthService } from 'docs-system/auth';

export class SharedAuthService {
  constructor(
    private ideAuthService: IDEAuthService,
    private docsAuthService: DocsAuthService
  ) {}

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    // Primary authentication through IDE Project Starter
    const ideAuth = await this.ideAuthService.authenticate(credentials);
    
    // Sync authentication to Documentation System
    await this.docsAuthService.syncSession(ideAuth.token, ideAuth.user);
    
    return {
      token: ideAuth.token,
      user: ideAuth.user,
      unified: true
    };
  }

  async validateToken(token: string): Promise<UserSession> {
    // Use the same token validation across both systems
    const ideSession = await this.ideAuthService.validateToken(token);
    
    // Ensure session is valid in both systems
    await this.docsAuthService.ensureSession(token, ideSession.user);
    
    return {
      ...ideSession,
      unifiedAccess: true
    };
  }

  async logout(token: string): Promise<void> {
    // Logout from both systems
    await Promise.all([
      this.ideAuthService.logout(token),
      this.docsAuthService.logout(token)
    ]);
  }
}
```

#### Shared Project Repository

```typescript
// integration/repositories/shared-project.repository.ts

import { ProjectRepository as IDEProjectRepo } from 'ide-project/repositories';
import { ProjectRepository as DocsProjectRepo } from 'docs-system/repositories';
import { EventBusService } from 'integration/events';

export class SharedProjectRepository {
  constructor(
    private ideProjectRepo: IDEProjectRepo,
    private docsProjectRepo: DocsProjectRepo,
    private eventBus: EventBusService
  ) {}

  async createProject(project: ProjectCreateDTO): Promise<Project> {
    // Create in IDE Project system first
    const ideProject = await this.ideProjectRepo.create(project);
    
    // Create corresponding project in Documentation System
    const docsProject = await this.docsProjectRepo.create({
      externalId: ideProject.id,
      name: ideProject.name,
      description: ideProject.description,
      // Map other relevant properties
    });
    
    // Link the projects
    await this.ideProjectRepo.setDocumentationProjectId(ideProject.id, docsProject.id);
    
    // Emit project created event
    this.eventBus.emit('project.created', {
      ideProjectId: ideProject.id,
      docsProjectId: docsProject.id,
      projectData: ideProject
    });
    
    return {
      ...ideProject,
      documentationProjectId: docsProject.id
    };
  }

  async getProject(id: string): Promise<UnifiedProject> {
    // Get project from IDE system
    const ideProject = await this.ideProjectRepo.findById(id);
    
    // Get linked documentation project
    const docsProject = await this.docsProjectRepo.findByExternalId(id);
    
    // Combine the data
    return this.mergeProjects(ideProject, docsProject);
  }

  async updateProject(id: string, data: ProjectUpdateDTO): Promise<UnifiedProject> {
    // Update in IDE Project system
    const ideProject = await this.ideProjectRepo.update(id, data);
    
    // Get docs project ID
    const docsProjectId = ideProject.documentationProjectId;
    
    // Update in Documentation System
    const docsProject = await this.docsProjectRepo.update(docsProjectId, {
      name: data.name,
      description: data.description,
      // Map other relevant properties
    });
    
    // Emit project updated event
    this.eventBus.emit('project.updated', {
      ideProjectId: ideProject.id,
      docsProjectId: docsProject.id,
      projectData: ideProject
    });
    
    return this.mergeProjects(ideProject, docsProject);
  }

  private mergeProjects(ideProject: IDEProject, docsProject: DocsProject): UnifiedProject {
    return {
      id: ideProject.id,
      name: ideProject.name,
      description: ideProject.description,
      research: ideProject.research,
      documentation: {
        id: docsProject.id,
        templates: docsProject.templates,
        documents: docsProject.documents,
        status: docsProject.status
      },
      // Merge other relevant properties
    };
  }
}
```

#### Event System Integration

```typescript
// integration/events/event-bus.service.ts

import { EventEmitter } from 'events';
import { RedisClient } from 'redis';

export class EventBusService {
  private localEmitter: EventEmitter;
  private redisClient: RedisClient;
  private redisSubscriber: RedisClient;
  
  constructor(redisUrl: string) {
    this.localEmitter = new EventEmitter();
    
    // Setup Redis pub/sub for distributed events
    this.redisClient = new RedisClient({ url: redisUrl });
    this.redisSubscriber = new RedisClient({ url: redisUrl });
    
    this.setupRedisSubscriber();
  }
  
  private setupRedisSubscriber() {
    this.redisSubscriber.on('message', (channel, message) => {
      const event = JSON.parse(message);
      // Emit locally but prevent infinite loops
      if (!event._fromInstanceId || event._fromInstanceId !== this.instanceId) {
        this.localEmitter.emit(channel, event);
      }
    });
  }
  
  subscribe(eventName: string, handler: Function) {
    // Subscribe to Redis channel
    this.redisSubscriber.subscribe(eventName);
    
    // Add local handler
    this.localEmitter.on(eventName, handler);
    
    return () => {
      this.localEmitter.off(eventName, handler);
      // Note: We don't unsubscribe from Redis as other handlers might exist
    };
  }
  
  emit(eventName: string, data: any) {
    // Add instance ID to prevent echo
    const eventData = {
      ...data,
      _fromInstanceId: this.instanceId,
      _timestamp: Date.now()
    };
    
    // Publish to Redis
    this.redisClient.publish(eventName, JSON.stringify(eventData));
    
    // Emit locally
    this.localEmitter.emit(eventName, eventData);
  }
}
```

### 2. Core Integration Implementation

#### Research-to-Documentation Linking

```typescript
// integration/services/research-doc-linking.service.ts

import { ResearchRepository } from 'ide-project/repositories';
import { DocumentRepository } from 'docs-system/repositories';
import { EventBusService } from 'integration/events';

export class ResearchDocLinkingService {
  constructor(
    private researchRepo: ResearchRepository,
    private documentRepo: DocumentRepository,
    private eventBus: EventBusService
  ) {
    // Subscribe to research updates
    this.eventBus.subscribe('research.updated', this.onResearchUpdated.bind(this));
    
    // Subscribe to document updates
    this.eventBus.subscribe('document.updated', this.onDocumentUpdated.bind(this));
  }
  
  async linkResearchToDocument(researchId: string, documentId: string): Promise<ResearchDocumentLink> {
    // Get research data
    const research = await this.researchRepo.findById(researchId);
    
    // Get document data
    const document = await this.documentRepo.findById(documentId);
    
    // Create mapping between research sections and document sections
    const mapping = this.generateMapping(research, document);
    
    // Store the mapping
    const link = await this.saveLinkMapping(researchId, documentId, mapping);
    
    // Update document with research data
    await this.populateDocumentFromResearch(document, research, mapping);
    
    return link;
  }
  
  private async onResearchUpdated(event: ResearchUpdatedEvent) {
    // Get linked documents
    const links = await this.findLinksByResearchId(event.researchId);
    
    // Update each linked document
    for (const link of links) {
      const document = await this.documentRepo.findById(link.documentId);
      const research = await this.researchRepo.findById(link.researchId);
      
      // Update document with new research data
      await this.populateDocumentFromResearch(document, research, link.mapping);
    }
  }
  
  private async onDocumentUpdated(event: DocumentUpdatedEvent) {
    // Get linked research
    const links = await this.findLinksByDocumentId(event.documentId);
    
    // Process each link to ensure bidirectional sync
    for (const link of links) {
      const document = await this.documentRepo.findById(link.documentId);
      const research = await this.researchRepo.findById(link.researchId);
      
      // Check if manual edits should update research data
      await this.updateResearchFromDocument(research, document, link.mapping);
    }
  }
  
  private generateMapping(research: Research, document: Document): SectionMapping[] {
    // Algorithm to map research sections to document sections
    // This would analyze content, structure, and metadata to create a mapping
    
    return [
      // Example mapping
      {
        researchSectionId: research.sections[0].id,
        documentSectionId: document.sections[1].id,
        confidence: 0.95,
        mappingType: 'direct'
      },
      // Additional mappings...
    ];
  }
  
  // Additional helper methods...
}
```

#### Unified Navigation

```typescript
// integration/navigation/unified-navigation.service.ts

import { Router as IDERouter } from 'ide-project/navigation';
import { Router as DocsRouter } from 'docs-system/navigation';

export class UnifiedNavigationService {
  constructor(
    private ideRouter: IDERouter,
    private docsRouter: DocsRouter
  ) {}
  
  navigateToProject(projectId: string) {
    this.ideRouter.navigate(`/projects/${projectId}`);
  }
  
  navigateToResearch(projectId: string, researchId: string) {
    this.ideRouter.navigate(`/projects/${projectId}/research/${researchId}`);
  }
  
  navigateToDocument(projectId: string, documentId: string) {
    this.docsRouter.navigate(`/documents/${documentId}`, {
      context: { projectId }
    });
  }
  
  navigateToResearchSection(projectId: string, researchId: string, sectionId: string) {
    this.ideRouter.navigate(`/projects/${projectId}/research/${researchId}/sections/${sectionId}`);
  }
  
  navigateToDocumentSection(projectId: string, documentId: string, sectionId: string) {
    this.docsRouter.navigate(`/documents/${documentId}/sections/${sectionId}`, {
      context: { projectId }
    });
  }
  
  navigateFromResearchToLinkedDocument(researchId: string, sectionId?: string) {
    // Look up the linked document
    return this.researchDocLinkingService.getLinkedDocument(researchId)
      .then(link => {
        if (sectionId && link.mapping) {
          // Find the corresponding document section
          const mapping = link.mapping.find(m => m.researchSectionId === sectionId);
          if (mapping) {
            this.navigateToDocumentSection(link.projectId, link.documentId, mapping.documentSectionId);
            return;
          }
        }
        
        // Default to document root if no section mapping
        this.navigateToDocument(link.projectId, link.documentId);
      });
  }
  
  // Additional navigation methods...
}
```

### 3. Collaborative Features Implementation

#### Real-time Collaboration Heatmap

```typescript
// integration/collaboration/heatmap.service.ts

import { UserSessionService } from 'integration/auth';
import { WebSocketService } from 'integration/websocket';

export class CollaborationHeatmapService {
  private activeUsers: Map<string, UserActivity> = new Map();
  
  constructor(
    private sessionService: UserSessionService,
    private wsService: WebSocketService
  ) {
    // Set up WebSocket handlers
    this.wsService.on('connection', this.handleConnection.bind(this));
    this.wsService.on('disconnection', this.handleDisconnection.bind(this));
    
    // Set up activity tracking
    this.setupActivityTracking();
    
    // Set up cleanup interval
    setInterval(this.cleanupStaleActivities.bind(this), 30000);
  }
  
  private handleConnection(client: WebSocketClient) {
    // Authenticate the connection
    this.sessionService.getUserFromToken(client.token).then(user => {
      if (!user) {
        client.disconnect('Unauthorized');
        return;
      }
      
      // Register client
      client.on('activity', data => this.recordActivity(user.id, data));
      
      // Send current activity state
      client.send('heatmap_state', Array.from(this.activeUsers.values()));
    });
  }
  
  private handleDisconnection(client: WebSocketClient) {
    // User disconnected, mark their activity as ended
    if (client.userId) {
      const activity = this.activeUsers.get(client.userId);
      if (activity) {
        this.activeUsers.delete(client.userId);
        this.broadcastActivityUpdate('user_inactive', { userId: client.userId });
      }
    }
  }
  
  private recordActivity(userId: string, data: ActivityData) {
    const activity: UserActivity = {
      userId,
      resourceType: data.resourceType, // 'code', 'document', etc.
      resourceId: data.resourceId,
      position: data.position,
      timestamp: Date.now(),
      intensity: data.hasOwnProperty('intensity') ? data.intensity : 1,
    };
    
    // Update user activity
    this.activeUsers.set(userId, activity);
    
    // Broadcast to all clients
    this.broadcastActivityUpdate('user_active', activity);
  }
  
  private broadcastActivityUpdate(event: string, data: any) {
    this.wsService.broadcast(event, data);
  }
  
  private cleanupStaleActivities() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, activity] of this.activeUsers.entries()) {
      if (now - activity.timestamp > staleThreshold) {
        this.activeUsers.delete(userId);
        this.broadcastActivityUpdate('user_inactive', { userId });
      }
    }
  }
  
  private setupActivityTracking() {
    // IDE Project activity tracking
    this.setupIDEActivityTracking();
    
    // Documentation System activity tracking
    this.setupDocsActivityTracking();
  }
  
  private setupIDEActivityTracking() {
    // Implement tracking for IDE cursor positions and edits
    // This would hook into the IDE's editor events
  }
  
  private setupDocsActivityTracking() {
    // Implement tracking for Documentation System editing
    // This would hook into the documentation editor events
  }
  
  // Frontend components would subscribe to these events
  // and render the heatmap visualization based on the activity data
}
```

#### Intelligent Search with Semantic Context

```typescript
// integration/search/semantic-search.service.ts

import { SearchService as IDESearchService } from 'ide-project/search';
import { SearchService as DocsSearchService } from 'docs-system/search';
import { ResearchDocLinkingService } from 'integration/services';

export class SemanticSearchService {
  constructor(
    private ideSearchService: IDESearchService,
    private docsSearchService: DocsSearchService,
    private linkingService: ResearchDocLinkingService
  ) {}
  
  async search(query: string, options?: SearchOptions): Promise<UnifiedSearchResults> {
    // Perform searches in parallel
    const [ideResults, docsResults] = await Promise.all([
      this.ideSearchService.search(query, options),
      this.docsSearchService.search(query, options)
    ]);
    
    // Process and combine results
    const combinedResults = await this.processResults(query, ideResults, docsResults);
    
    // Enhance with semantic context
    const enhancedResults = await this.enhanceWithSemanticContext(combinedResults);
    
    return enhancedResults;
  }
  
  private async processResults(
    query: string, 
    ideResults: IDESearchResults, 
    docsResults: DocsSearchResults
  ): Promise<UnifiedSearchResults> {
    // Combine results with source identification
    const combined = [
      ...ideResults.items.map(item => ({
        ...item,
        source: 'ide',
        type: this.mapIDEResultType(item.type)
      })),
      ...docsResults.items.map(item => ({
        ...item,
        source: 'docs',
        type: this.mapDocsResultType(item.type)
      }))
    ];
    
    // Sort by relevance
    combined.sort((a, b) => b.score - a.score);
    
    return {
      query,
      totalResults: ideResults.totalResults + docsResults.totalResults,
      items: combined
    };
  }
  
  private async enhanceWithSemanticContext(results: UnifiedSearchResults): Promise<UnifiedSearchResults> {
    // Identify related items across systems
    const enhancedItems = await Promise.all(results.items.map(async item => {
      // Find linked items
      const linkedItems = await this.findLinkedItems(item);
      
      // Enhance with contextual information
      return {
        ...item,
        context: {
          linkedItems,
          semanticTags: await this.generateSemanticTags(item),
          contextSummary: await this.generateContextSummary(item)
        }
      };
    }));
    
    return {
      ...results,
      items: enhancedItems
    };
  }
  
  private async findLinkedItems(item: SearchResultItem): Promise<LinkedItem[]> {
    if (item.source === 'ide' && item.type === 'research_section') {
      // Find linked document sections
      const links = await this.linkingService.findLinksByResearchSectionId(item.id);
      return links.map(link => ({
        id: link.documentSectionId,
        type: 'document_section',
        source: 'docs',
        title: link.documentSectionTitle,
        relationStrength: link.confidence
      }));
    } else if (item.source === 'docs' && item.type === 'document_section') {
      // Find linked research sections
      const links = await this.linkingService.findLinksByDocumentSectionId(item.id);
      return links.map(link => ({
        id: link.researchSectionId,
        type: 'research_section',
        source: 'ide',
        title: link.researchSectionTitle,
        relationStrength: link.confidence
      }));
    }
    
    return [];
  }
  
  // Helper methods for type mapping, semantic tag generation, etc.
}
```

#### AI-powered Document Health Score

```typescript
// integration/quality/document-health.service.ts

import { CodeAnalysisService } from 'ide-project/quality';
import { DocumentAnalysisService } from 'docs-system/quality';
import { ResearchDocLinkingService } from 'integration/services';

export class DocumentHealthService {
  constructor(
    private codeAnalysisService: CodeAnalysisService,
    private documentAnalysisService: DocumentAnalysisService,
    private linkingService: ResearchDocLinkingService
  ) {}
  
  async calculateHealthScore(documentId: string): Promise<DocumentHealthScore> {
    // Get document details
    const document = await this.documentAnalysisService.getDocumentDetails(documentId);
    
    // Get linked research and code
    const links = await this.linkingService.findLinksByDocumentId(documentId);
    const projectId = document.projectId;
    
    // Get code complexity metrics
    const codeMetrics = await this.codeAnalysisService.getProjectMetrics(projectId);
    
    // Calculate base document metrics
    const baseMetrics = await this.documentAnalysisService.analyzeDocument(documentId);
    
    // Calculate coverage score
    const coverageScore = await this.calculateCoverageScore(document, links, codeMetrics);
    
    // Calculate quality score
    const qualityScore = await this.calculateQualityScore(baseMetrics);
    
    // Calculate freshness score
    const freshnessScore = await this.calculateFreshnessScore(document, codeMetrics);
    
    // Calculate overall health score
    const overallScore = this.calculateOverallScore(coverageScore, qualityScore, freshnessScore);
    
    // Generate improvement recommendations
    const recommendations = await this.generateRecommendations(
      documentId, 
      coverageScore, 
      qualityScore, 
      freshnessScore,
      codeMetrics
    );
    
    return {
      documentId,
      overallScore,
      components: {
        coverageScore,
        qualityScore,
        freshnessScore
      },
      metrics: {
        completeness: baseMetrics.completeness,
        readability: baseMetrics.readability,
        technicalAccuracy: baseMetrics.technicalAccuracy,
        // Additional metrics...
      },
      recommendations,
      timestamp: Date.now()
    };
  }
  
  private async calculateCoverageScore(
    document: DocumentDetails, 
    links: ResearchDocumentLink[],
    codeMetrics: CodeMetrics
  ): Promise<number> {
    // Calculate how well the document covers the code complexity
    // Higher complexity should have more documentation coverage
    
    // Get all code components
    const codeComponents = codeMetrics.components;
    
    // Calculate coverage for each component
    let totalCoverage = 0;
    let totalWeight = 0;
    
    for (const component of codeComponents) {
      // Find documentation sections covering this component
      const componentCoverage = this.calculateComponentCoverage(component, document, links);
      
      // Weight by complexity
      const weight = component.complexity;
      totalCoverage += componentCoverage * weight;
      totalWeight += weight;
    }
    
    // Normalize to 0-100 scale
    return totalWeight > 0 ? (totalCoverage / totalWeight) * 100 : 0;
  }
  
  private async calculateQualityScore(baseMetrics: DocumentMetrics): Promise<number> {
    // Calculate quality based on readability, structure, completeness
    const readabilityWeight = 0.4;
    const structureWeight = 0.3;
    const completenessWeight = 0.3;
    
    return (
      baseMetrics.readability * readabilityWeight +
      baseMetrics.structure * structureWeight +
      baseMetrics.completeness * completenessWeight
    ) * 100;
  }
  
  private async calculateFreshnessScore(
    document: DocumentDetails,
    codeMetrics: CodeMetrics
  ): Promise<number> {
    // Calculate how up-to-date the documentation is relative to code changes
    
    // Get document last updated timestamp
    const docLastUpdated = document.updatedAt;
    
    // Get latest code change timestamp
    const codeLastUpdated = codeMetrics.lastUpdated;
    
    // Calculate staleness factor (1.0 = fresh, 0.0 = stale)
    const maxStaleDays = 30; // Consider documentation stale after 30 days
    const daysSinceCodeUpdate = (Date.now() - codeLastUpdated) / (1000 * 60 * 60 * 24);
    const daysSinceDocUpdate = (Date.now() - docLastUpdated) / (1000 * 60 * 60 * 24);
    
    // If doc was updated after code, it's fresh
    if (docLastUpdated > codeLastUpdated) {
      return 100;
    }
    
    // Calculate staleness based on time difference
    const daysGap = daysSinceDocUpdate - daysSinceCodeUpdate;
    const freshnessFactor = Math.max(0, 1 - (daysGap / maxStaleDays));
    
    return freshnessFactor * 100;
  }
  
  private calculateOverallScore(
    coverageScore: number,
    qualityScore: number,
    freshnessScore: number
  ): number {
    // Weight the scores
    const coverageWeight = 0.4;
    const qualityWeight = 0.4;
    const freshnessWeight = 0.2;
    
    return (
      coverageScore * coverageWeight +
      qualityScore * qualityWeight +
      freshnessScore * freshnessWeight
    );
  }
  
  private async generateRecommendations(
    documentId: string,
    coverageScore: number,
    qualityScore: number,
    freshnessScore: number,
    codeMetrics: CodeMetrics
  ): Promise<HealthRecommendation[]> {
    const recommendations: HealthRecommendation[] = [];
    
    // Add coverage recommendations
    if (coverageScore < 70) {
      const uncoveredComponents = await this.findUncoveredComponents(documentId, codeMetrics);
      
      recommendations.push({
        type: 'coverage',
        priority: coverageScore < 50 ? 'high' : 'medium',
        message: `Improve documentation coverage for ${uncoveredComponents.length} code components`,
        details: `Focus on these components: ${uncoveredComponents.slice(0, 3).join(', ')}`,
        actionable: true
      });
    }
    
    // Add quality recommendations
    if (qualityScore < 70) {
      const qualityIssues = await this.findQualityIssues(documentId);
      
      recommendations.push({
        type: 'quality',
        priority: qualityScore < 50 ? 'high' : 'medium',
        message: `Improve documentation quality in ${qualityIssues.length} areas`,
        details: `Focus on: ${qualityIssues.slice(0, 3).join(', ')}`,
        actionable: true
      });
    }
    
    // Add freshness recommendations
    if (freshnessScore < 70) {
      const outdatedSections = await this.findOutdatedSections(documentId, codeMetrics);
      
      recommendations.push({
        type: 'freshness',
        priority: freshnessScore < 50 ? 'high' : 'medium',
        message: `Update documentation to reflect recent code changes`,
        details: `${outdatedSections.length} sections need updates based on recent code changes`,
        actionable: true
      });
    }
    
    return recommendations;
  }
  
  // Additional helper methods...
}
```

## Frontend Integration

### Creating Unified UI Components

#### Shared Component Library

```typescript
// integration/ui/theme.ts

import { Theme as IDETheme } from 'ide-project/ui/theme';
import { Theme as DocsTheme } from 'docs-system/ui/theme';

export const UnifiedTheme = {
  // Common colors
  colors: {
    primary: DocsTheme.colors.primary,
    secondary: IDETheme.colors.accent,
    background: IDETheme.colors.background,
    surface: DocsTheme.colors.surface,
    text: IDETheme.colors.text,
    error: IDETheme.colors.error,
    warning: IDETheme.colors.warning,
    success: DocsTheme.colors.success,
    // Additional colors...
  },
  
  // Typography
  typography: {
    fontFamily: DocsTheme.typography.fontFamily,
    fontSize: IDETheme.typography.fontSize,
    headings: DocsTheme.typography.headings,
    body: IDETheme.typography.body,
    code: IDETheme.typography.code,
    // Additional typography settings...
  },
  
  // Spacing
  spacing: {
    unit: 8, // 8px base unit
    // Derive spacing values from the base unit
    xs: 8 * 0.5,  // 4px
    sm: 8,        // 8px
    md: 8 * 2,    // 16px
    lg: 8 * 3,    // 24px
    xl: 8 * 4,    // 32px
    // Additional spacing values...
  },
  
  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
  
  // Shadows
  shadows: DocsTheme.shadows,
  
  // Borders
  borders: {
    radius: IDETheme.borders.radius,
    width: IDETheme.borders.width,
    style: IDETheme.borders.style,
    color: DocsTheme.colors.border,
  },
  
  // Transitions
  transitions: {
    duration: {
      short: 150,
      medium: 300,
      long: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      // Additional easing functions...
    },
  },
  
  // Z-index scale
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    tooltip: 1400,
    // Additional z-index values...
  },
};
```

#### Collaboration Heatmap Component

```tsx
// integration/ui/components/CollaborationHeatmap.tsx

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWebSocket } from 'integration/hooks/useWebSocket';
import { Avatar, Tooltip } from 'integration/ui/components';

interface CollaborationHeatmapProps {
  resourceType: 'code' | 'document';
  resourceId: string;
  containerSelector: string;
}

export const CollaborationHeatmap: React.FC<CollaborationHeatmapProps> = ({
  resourceType,
  resourceId,
  containerSelector,
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);
  const { socket, connected } = useWebSocket('/collaboration');
  
  useEffect(() => {
    // Get container element
    containerRef.current = document.querySelector(containerSelector);
    
    // Subscribe to WebSocket events
    if (connected) {
      // Join the room for this resource
      socket.emit('join_resource', { resourceType, resourceId });
      
      // Listen for activity updates
      socket.on('user_active', handleUserActive);
      socket.on('user_inactive', handleUserInactive);
      socket.on('heatmap_state', handleHeatmapState);
      
      // Setup cleanup
      return () => {
        socket.off('user_active', handleUserActive);
        socket.off('user_inactive', handleUserInactive);
        socket.off('heatmap_state', handleHeatmapState);
        socket.emit('leave_resource', { resourceType, resourceId });
      };
    }
  }, [resourceType, resourceId, connected, containerSelector]);
  
  const handleUserActive = (activity: UserActivity) => {
    setActivities(prev => {
      // Replace or add the activity
      const filtered = prev.filter(a => a.userId !== activity.userId);
      return [...filtered, activity];
    });
  };
  
  const handleUserInactive = (data: { userId: string }) => {
    setActivities(prev => prev.filter(a => a.userId !== data.userId));
  };
  
  const handleHeatmapState = (state: UserActivity[]) => {
    setActivities(state);
  };
  
  // Don't render if no container found
  if (!containerRef.current) {
    return null;
  }
  
  // Use portal to render into the container
  return createPortal(
    <div className="collaboration-heatmap">
      {activities.map(activity => (
        <ActivityIndicator
          key={activity.userId}
          activity={activity}
          containerBounds={containerRef.current!.getBoundingClientRect()}
        />
      ))}
    </div>,
    containerRef.current
  );
};

interface ActivityIndicatorProps {
  activity: UserActivity;
  containerBounds: DOMRect;
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  activity,
  containerBounds,
}) => {
  // Calculate position within container
  const posX = (activity.position.x / 100) * containerBounds.width;
  const posY = (activity.position.y / 100) * containerBounds.height;
  
  return (
    <div
      className="activity-indicator"
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
    >
      <Tooltip title={`${activity.userName} is editing this section`}>
        <div className="user-cursor">
          <div 
            className="cursor-pointer"
            style={{
              width: '10px',
              height: '10px',
              background: activity.userColor,
              borderRadius: '50%',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.5), 0 0 0 6px ' + activity.userColor + '44',
            }}
          />
          <Avatar
            user={activity}
            size="small"
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
      </Tooltip>
    </div>
  );
};
```

#### Semantic Search Component

```tsx
// integration/ui/components/SemanticSearch.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'integration/hooks/useDebounce';
import { SemanticSearchService } from 'integration/search/semantic-search.service';

interface SemanticSearchProps {
  onResultSelect?: (result: SearchResultItem) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({
  onResultSelect,
  placeholder = 'Search across code and documentation...',
  initialQuery = '',
  className,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UnifiedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const searchService = new SemanticSearchService();
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      searchService.search(debouncedQuery)
        .then(results => {
          setResults(results);
          setActiveIndex(-1);
        })
        .catch(error => {
          console.error('Search error:', error);
          setResults(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < results.items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (activeIndex >= 0 && results.items[activeIndex]) {
          handleResultClick(results.items[activeIndex]);
        }
        break;
      case 'Escape':
        setResults(null);
        break;
    }
  };
  
  const handleResultClick = (result: SearchResultItem) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setResults(null);
    setQuery('');
  };
  
  return (
    <div className={`semantic-search ${className || ''}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
        />
        {loading && <div className="search-spinner" />}
      </div>
      
      {results && results.items.length > 0 && (
        <div className="search-results" ref={resultsRef}>
          {results.items.map((item, index) => (
            <div
              key={`${item.source}-${item.id}`}
              className={`search-result ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleResultClick(item)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="result-icon">
                {item.source === 'ide' ? (
                  <CodeIcon type={item.type} />
                ) : (
                  <DocIcon type={item.type} />
                )}
              </div>
              <div className="result-content">
                <div className="result-title">{item.title}</div>
                <div className="result-path">{item.path}</div>
                <div className="result-snippet">{item.snippet}</div>
                
                {item.context?.linkedItems && item.context.linkedItems.length > 0 && (
                  <div className="linked-items">
                    <span className="linked-label">Related:</span>
                    {item.context.linkedItems.map(linked => (
                      <span 
                        key={`${linked.source}-${linked.id}`}
                        className="linked-item"
                      >
                        {linked.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper icon components
const CodeIcon = ({ type }: { type: string }) => {
  // Return appropriate icon based on type
  return <div className={`code-icon ${type}`} />;
};

const DocIcon = ({ type }: { type: string }) => {
  // Return appropriate icon based on type
  return <div className={`doc-icon ${type}`} />;
};
```

#### Integrated Visual Changelog with Storytelling Elements

```typescript
// integration/changelog/changelog.service.ts

import { EventBusService } from 'integration/events';
import { ResearchDocLinkingService } from 'integration/services';
import { CommitService } from 'ide-project/source-control';
import { DocumentVersionService } from 'docs-system/versioning';
import { NarrativeService } from 'integration/changelog/narrative.service';
import { MediaProcessorService } from 'integration/changelog/media-processor.service';

export class ChangelogService {
  constructor(
    private eventBus: EventBusService,
    private linkingService: ResearchDocLinkingService,
    private commitService: CommitService,
    private documentVersionService: DocumentVersionService,
    private narrativeService: NarrativeService,
    private mediaProcessor: MediaProcessorService
  ) {
    // Subscribe to relevant events
    this.setupEventSubscriptions();
  }
  
  private setupEventSubscriptions() {
    // Code change events
    this.eventBus.subscribe('code.commit', this.handleCodeCommit.bind(this));
    this.eventBus.subscribe('code.pull-request.merged', this.handlePRMerged.bind(this));
    
    // Documentation events
    this.eventBus.subscribe('document.version.created', this.handleDocVersionCreated.bind(this));
    this.eventBus.subscribe('document.published', this.handleDocPublished.bind(this));
    
    // Research events
    this.eventBus.subscribe('research.completed', this.handleResearchCompleted.bind(this));
    this.eventBus.subscribe('research.milestone', this.handleResearchMilestone.bind(this));
    
    // Project events
    this.eventBus.subscribe('project.milestone', this.handleProjectMilestone.bind(this));
  }
  
  async handleCodeCommit(event: CodeCommitEvent) {
    // Create a changelog entry for the code commit
    const entry = await this.createCodeChangeEntry(event);
    
    // Find related documentation changes
    const relatedDocs = await this.findRelatedDocumentChanges(event.projectId, event.files);
    
    // If there are related doc changes, link them to this entry
    if (relatedDocs.length > 0) {
      await this.linkChanges(entry.id, relatedDocs.map(doc => doc.id));
      
      // Try to generate a narrative connecting code and docs
      await this.narrativeService.generateConnectionNarrative(entry.id, relatedDocs);
    }
    
    // Process code diffs for visualization
    const diffMedia = await this.mediaProcessor.generateCodeDiffMedia(event.diff);
    await this.addMediaToEntry(entry.id, diffMedia);
    
    return entry;
  }
  
  async handleDocVersionCreated(event: DocVersionEvent) {
    // Create a changelog entry for the doc version
    const entry = await this.createDocChangeEntry(event);
    
    // Find related code changes
    const relatedCode = await this.findRelatedCodeChanges(event.projectId, event.documentId);
    
    // If there are related code changes, link them to this entry
    if (relatedCode.length > 0) {
      await this.linkChanges(entry.id, relatedCode.map(code => code.id));
    }
    
    // Process doc diffs for visualization
    const diffMedia = await this.mediaProcessor.generateDocDiffMedia(event.diff);
    await this.addMediaToEntry(entry.id, diffMedia);
    
    return entry;
  }
  
  async handleProjectMilestone(event: MilestoneEvent) {
    // Create a milestone entry
    const entry = await this.createMilestoneEntry(event);
    
    // Find relevant changes leading up to this milestone
    const relevantChanges = await this.findChangesForMilestone(
      event.projectId, 
      event.milestoneDate
    );
    
    // Link all relevant changes to this milestone
    if (relevantChanges.length > 0) {
      await this.linkChanges(entry.id, relevantChanges.map(change => change.id));
      
      // Generate milestone narrative
      await this.narrativeService.generateMilestoneNarrative(
        entry.id, 
        relevantChanges
      );
    }
    
    // Check if this completes a story arc
    await this.checkAndUpdateStoryArcs(event.projectId, event.milestoneId);
    
    return entry;
  }
  
  async createStoryArc(data: StoryArcCreateDTO): Promise<StoryArc> {
    // Create a new story arc
    const storyArc = {
      id: generateId(),
      title: data.title,
      description: data.description,
      entries: data.entries || [],
      theme: data.theme,
      startDate: data.startDate || new Date(),
      endDate: data.endDate,
      contributors: data.contributors || [],
      status: data.endDate ? 'completed' : 'in-progress'
    };
    
    // Store the story arc
    await this.saveStoryArc(storyArc);
    
    // Notify entry additions
    if (storyArc.entries.length > 0) {
      await this.updateEntriesWithStoryArc(storyArc.entries, storyArc.id);
    }
    
    return storyArc;
  }
  
  async addNarrativeElement(
    changelogId: string, 
    elementData: NarrativeElementCreateDTO
  ): Promise<NarrativeElement> {
    // Create narrative element
    const element = {
      id: generateId(),
      type: elementData.type,
      content: elementData.content,
      author: elementData.author,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: elementData.attachments || []
    };
    
    // Add to changelog entry
    await this.addNarrativeElementToEntry(changelogId, element);
    
    return element;
  }
  
  async getChangelogTimeline(
    projectId: string,
    options: TimelineOptions
  ): Promise<ChangelogTimeline> {
    // Get all changes for this project within date range
    const entries = await this.getProjectChanges(
      projectId,
      options.startDate,
      options.endDate,
      options.types
    );
    
    // Get story arcs that overlap with the date range
    const storyArcs = await this.getProjectStoryArcs(
      projectId,
      options.startDate,
      options.endDate
    );
    
    // Organize entries by track (code, documentation, research, milestone)
    const tracks = this.organizeEntriesByTrack(entries);
    
    // Calculate connections between entries
    const connections = await this.calculateEntryConnections(entries);
    
    return {
      projectId,
      timeRange: {
        start: options.startDate,
        end: options.endDate
      },
      tracks,
      connections,
      storyArcs,
      totalEntries: entries.length
    };
  }
  
  // Additional helper methods would be implemented here...
}
```

```typescript
// integration/changelog/narrative.service.ts

import { AIService } from 'integration/ai';
import { NarrativeRepository } from 'integration/changelog/narrative.repository';

export class NarrativeService {
  constructor(
    private aiService: AIService,
    private narrativeRepo: NarrativeRepository
  ) {}
  
  async generateConnectionNarrative(
    entryId: string,
    relatedEntries: ChangelogEntry[]
  ): Promise<NarrativeElement[]> {
    // Get the main entry
    const mainEntry = await this.narrativeRepo.getChangelogEntry(entryId);
    
    // Extract content from all entries for context
    const context = this.extractNarrativeContext(mainEntry, relatedEntries);
    
    // Generate narrative using AI assistance
    const narrativeElements = await this.aiService.generateNarrativeElements({
      entryType: mainEntry.type,
      entryTitle: mainEntry.title,
      entryDescription: mainEntry.description,
      relatedChanges: context.relatedChanges,
      codeContext: context.codeContext,
      docContext: context.docContext,
      relationshipType: context.relationshipType
    });
    
    // Save the generated narrative elements
    const savedElements = await Promise.all(
      narrativeElements.map(element => 
        this.narrativeRepo.addNarrativeElement(entryId, {
          type: element.type,
          content: element.content,
          author: {
            id: 'ai-assistant',
            name: 'AI Assistant',
            avatar: '/assets/ai-avatar.png'
          },
          attachments: element.attachments || []
        })
      )
    );
    
    return savedElements;
  }
  
  async generateMilestoneNarrative(
    milestoneId: string,
    relatedChanges: ChangelogEntry[]
  ): Promise<NarrativeElement[]> {
    // Get the milestone entry
    const milestone = await this.narrativeRepo.getChangelogEntry(milestoneId);
    
    // Group changes by type and significance
    const groupedChanges = this.groupChangesByTypeAndSignificance(relatedChanges);
    
    // Generate milestone summary using AI assistance
    const summaryElement = await this.aiService.generateMilestoneSummary({
      milestoneName: milestone.title,
      milestoneDescription: milestone.description,
      majorChanges: groupedChanges.major,
      moderateChanges: groupedChanges.moderate,
      minorChanges: groupedChanges.minor,
      timespan: {
        start: groupedChanges.startDate,
        end: groupedChanges.endDate
      }
    });
    
    // Generate milestone impact narrative
    const impactElement = await this.aiService.generateMilestoneImpact({
      milestoneName: milestone.title,
      changes: relatedChanges,
      projectContext: await this.getProjectContext(milestone.projectId)
    });
    
    // Save the generated narrative elements
    const savedElements = await Promise.all([
      this.narrativeRepo.addNarrativeElement(milestoneId, {
        type: 'context',
        content: summaryElement.content,
        author: {
          id: 'ai-assistant',
          name: 'AI Assistant',
          avatar: '/assets/ai-avatar.png'
        },
        attachments: summaryElement.attachments || []
      }),
      this.narrativeRepo.addNarrativeElement(milestoneId, {
        type: 'impact',
        content: impactElement.content,
        author: {
          id: 'ai-assistant',
          name: 'AI Assistant',
          avatar: '/assets/ai-avatar.png'
        },
        attachments: impactElement.attachments || []
      })
    ]);
    
    return savedElements;
  }
  
  async detectPotentialStoryArcs(
    projectId: string,
    timeRange: { start: Date, end: Date }
  ): Promise<StoryArcSuggestion[]> {
    // Get changes in the time range
    const changes = await this.narrativeRepo.getProjectChanges(
      projectId,
      timeRange.start,
      timeRange.end
    );
    
    // Skip if too few changes
    if (changes.length < 5) {
      return [];
    }
    
    // Analyze changes to detect patterns
    const themes = await this.analyzeChangesForThemes(changes);
    
    // Generate story arc suggestions for each theme
    const suggestions = await Promise.all(
      themes.map(async theme => {
        const relatedChanges = changes.filter(change => 
          this.isChangeRelatedToTheme(change, theme)
        );
        
        // Skip themes with too few related changes
        if (relatedChanges.length < 3) {
          return null;
        }
        
        const arcSummary = await this.aiService.generateStoryArcSuggestion({
          theme: theme.name,
          changes: relatedChanges,
          projectContext: await this.getProjectContext(projectId)
        });
        
        return {
          theme: theme.name,
          suggestedTitle: arcSummary.title,
          suggestedDescription: arcSummary.description,
          relatedEntryIds: relatedChanges.map(change => change.id),
          confidence: theme.confidence,
          startDate: new Date(Math.min(...relatedChanges.map(c => c.timestamp.getTime()))),
          endDate: new Date(Math.max(...relatedChanges.map(c => c.timestamp.getTime())))
        };
      })
    );
    
    // Filter out nulls and sort by confidence
    return suggestions
      .filter(Boolean)
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  // Additional helper methods would be implemented here...
}
```

```typescript
// integration/changelog/media-processor.service.ts

import { DiffService } from 'ide-project/diff';
import { DiagramService } from 'docs-system/diagrams';

export class MediaProcessorService {
  constructor(
    private diffService: DiffService,
    private diagramService: DiagramService
  ) {}
  
  async generateCodeDiffMedia(diff: CodeDiff): Promise<MediaElement> {
    // Process code diff to create a visual representation
    const highlightedDiff = await this.diffService.highlightCodeDiff(diff);
    
    // Create media element
    return {
      id: generateId(),
      type: 'code-diff',
      title: `Changes to ${diff.filePath}`,
      content: highlightedDiff,
      caption: `${diff.stats.additions} additions and ${diff.stats.deletions} deletions`,
      createdAt: new Date()
    };
  }
  
  async generateDocDiffMedia(diff: DocDiff): Promise<MediaElement> {
    // Process doc diff to create a visual representation
    const docComparison = await this.diffService.generateDocComparison(diff);
    
    // Create media element
    return {
      id: generateId(),
      type: 'doc-diff',
      title: `Changes to ${diff.documentTitle}`,
      content: docComparison,
      caption: `Document version ${diff.fromVersion} to ${diff.toVersion}`,
      createdAt: new Date()
    };
  }
  
  async generateArchitectureDiagram(
    components: Component[],
    connections: Connection[]
  ): Promise<MediaElement> {
    // Generate an architecture diagram
    const diagram = await this.diagramService.generateArchitectureDiagram(
      components,
      connections
    );
    
    // Create media element
    return {
      id: generateId(),
      type: 'diagram',
      title: 'Architecture Overview',
      content: diagram,
      caption: 'System architecture diagram showing component relationships',
      createdAt: new Date()
    };
  }
  
  async generateChangeImpactVisualization(
    changes: ChangelogEntry[],
    impactAnalysis: ImpactAnalysis
  ): Promise<MediaElement> {
    // Generate a visualization showing the impact of changes
    const visualization = await this.diagramService.generateImpactVisualization(
      changes,
      impactAnalysis
    );
    
    // Create media element
    return {
      id: generateId(),
      type: 'chart',
      title: 'Change Impact Analysis',
      content: visualization,
      caption: 'Visualization of change impact across system components',
      createdAt: new Date()
    };
  }
  
  async processSvgDiagram(svgContent: string): Promise<MediaElement> {
    // Validate and optimize SVG content
    const processedSvg = await this.diagramService.processSvgContent(svgContent);
    
    // Create media element
    return {
      id: generateId(),
      type: 'diagram',
      title: 'Custom Diagram',
      content: processedSvg,
      caption: 'Custom diagram uploaded by user',
      createdAt: new Date()
    };
  }
  
  // Additional helper methods would be implemented here...
}
```

#### Visual Changelog Component

```tsx
// integration/ui/components/VisualChangelog.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ChangelogService } from 'integration/changelog/changelog.service';
import { NarrativeService } from 'integration/changelog/narrative.service';
import { TimelineTrack } from './TimelineTrack';
import { TimelineConnectors } from './TimelineConnectors';
import { EntryDetail } from './EntryDetail';
import { StoryArcList } from './StoryArcList';
import { TimeRangeSelector } from './TimeRangeSelector';

interface VisualChangelogProps {
  projectId: string;
  initialStartDate?: Date;
  initialEndDate?: Date;
  showStoryArcs?: boolean;
  onEntrySelect?: (entry: ChangelogEntry) => void;
  className?: string;
}

export const VisualChangelog: React.FC<VisualChangelogProps> = ({
  projectId,
  initialStartDate,
  initialEndDate,
  showStoryArcs = true,
  onEntrySelect,
  className,
}) => {
  // Default to last 30 days if no initial dates provided
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [startDate, setStartDate] = useState<Date>(initialStartDate || defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate || now);
  const [timeline, setTimeline] = useState<ChangelogTimeline | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'story'>('timeline');
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const changelogService = new ChangelogService();
  const narrativeService = new NarrativeService();
  
  useEffect(() => {
    loadTimelineData();
  }, [projectId, startDate, endDate]);
  
  const loadTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timelineData = await changelogService.getChangelogTimeline(
        projectId,
        {
          startDate,
          endDate,
          types: ['code', 'documentation', 'research', 'milestone']
        }
      );
      
      setTimeline(timelineData);
      
      // If there are story arcs but no selected entry, select the latest entry
      if (
        showStoryArcs &&
        timelineData.storyArcs.length > 0 &&
        !selectedEntry &&
        viewMode === 'story'
      ) {
        const latestStoryArc = timelineData.storyArcs.sort(
          (a, b) => b.startDate.getTime() - a.startDate.getTime()
        )[0];
        
        if (latestStoryArc.entries.length > 0) {
          setSelectedEntry(latestStoryArc.entries[0]);
        }
      }
    } catch (err) {
      setError(`Failed to load changelog data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEntryClick = (entryId: string) => {
    setSelectedEntry(entryId);
    
    if (onEntrySelect && timeline) {
      const entry = timeline.tracks
        .flatMap(track => track.entries)
        .find(entry => entry.id === entryId);
      
      if (entry) {
        onEntrySelect(entry);
      }
    }
  };
  
  const handleTimeRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };
  
  const handleViewModeChange = (mode: 'timeline' | 'story') => {
    setViewMode(mode);
  };
  
  const handleCreateStoryArc = async () => {
    if (!timeline || !selectedEntry) return;
    
    // Find selected entry
    const entry = timeline.tracks
      .flatMap(track => track.entries)
      .find(entry => entry.id === selectedEntry);
    
    if (!entry) return;
    
    // Get suggestions for story arcs
    const suggestions = await narrativeService.detectPotentialStoryArcs(
      projectId,
      {
        start: new Date(entry.timestamp.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(entry.timestamp.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    );
    
    // If there are suggestions, show them in a modal
    if (suggestions.length > 0) {
      // Show story arc creation modal with suggestions
      // This would be implemented in a separate component
    } else {
      // Show empty story arc creation form
    }
  };
  
  if (loading && !timeline) {
    return (
      <div className={`visual-changelog loading ${className || ''}`}>
        <div className="timeline-loading-spinner" />
        <span>Loading changelog data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`visual-changelog error ${className || ''}`}>
        <div className="timeline-error-icon" />
        <span>{error}</span>
        <button onClick={loadTimelineData}>Retry</button>
      </div>
    );
  }
  
  if (!timeline) {
    return (
      <div className={`visual-changelog empty ${className || ''}`}>
        <span>No changelog data available for this project.</span>
      </div>
    );
  }
  
  return (
    <div className={`visual-changelog ${className || ''}`}>
      <div className="timeline-controls">
        <TimeRangeSelector 
          startDate={startDate}
          endDate={endDate}
          onChange={handleTimeRangeChange}
        />
        
        <div className="view-mode-selector">
          <button 
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => handleViewModeChange('timeline')}
          >
            Timeline View
          </button>
          <button 
            className={viewMode === 'story' ? 'active' : ''}
            onClick={() => handleViewModeChange('story')}
          >
            Story View
          </button>
        </div>
        
        <div className="zoom-controls">
          <button 
            onClick={() => handleZoomChange(Math.max(0.5, zoomLevel - 0.25))}
            disabled={zoomLevel <= 0.5}
          >
            Zoom Out
          </button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button 
            onClick={() => handleZoomChange(Math.min(2, zoomLevel + 0.25))}
            disabled={zoomLevel >= 2}
          >
            Zoom In
          </button>
        </div>
      </div>
      
      <div className="timeline-layout">
        {viewMode === 'timeline' ? (
          <div 
            className="timeline-container"
            ref={timelineRef}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {timeline.tracks.map(track => (
              <TimelineTrack
                key={track.type}
                track={track}
                selectedEntry={selectedEntry}
                startDate={startDate}
                endDate={endDate}
                onEntryClick={handleEntryClick}
              />
            ))}
            
            <TimelineConnectors 
              connections={timeline.connections}
              timeRange={{ start: startDate, end: endDate }}
              trackMap={timeline.tracks.reduce((map, track) => {
                map[track.type] = track;
                return map;
              }, {} as Record<string, TimelineTrack>)}
            />
          </div>
        ) : (
          <StoryArcList
            storyArcs={timeline.storyArcs}
            entries={timeline.tracks.flatMap(track => track.entries)}
            selectedEntry={selectedEntry}
            onEntryClick={handleEntryClick}
            onCreateStoryArc={handleCreateStoryArc}
          />
        )}
        
        {selectedEntry && (
          <EntryDetail
            entryId={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </div>
  );
};
```

```tsx
// integration/ui/components/TimelineTrack.tsx

import React from 'react';
import { TimelineEntry } from './TimelineEntry';

interface TimelineTrackProps {
  track: TimelineTrack;
  selectedEntry: string | null;
  startDate: Date;
  endDate: Date;
  onEntryClick: (entryId: string) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  selectedEntry,
  startDate,
  endDate,
  onEntryClick,
}) => {
  const timeRange = endDate.getTime() - startDate.getTime();
  
  // Helper to calculate position on timeline
  const calculatePosition = (date: Date): number => {
    const position = (date.getTime() - startDate.getTime()) / timeRange * 100;
    return Math.max(0, Math.min(100, position));
  };
  
  return (
    <div className={`timeline-track track-${track.type}`}>
      <div className="track-header">
        <h3>{getTrackTitle(track.type)}</h3>
        <span className="entry-count">{track.entries.length} changes</span>
      </div>
      
      <div className="track-content">
        {track.entries.map(entry => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            position={calculatePosition(entry.timestamp)}
            isSelected={selectedEntry === entry.id}
            onClick={() => onEntryClick(entry.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Helper to get human-readable track titles
const getTrackTitle = (trackType: string): string => {
  switch (trackType) {
    case 'code':
      return 'Code Changes';
    case 'documentation':
      return 'Documentation Updates';
    case 'research':
      return 'Research Activities';
    case 'milestone':
      return 'Project Milestones';
    default:
      return trackType.charAt(0).toUpperCase() + trackType.slice(1);
  }
};
```

```tsx
// integration/ui/components/EntryDetail.tsx

import React, { useState, useEffect } from 'react';
import { ChangelogService } from 'integration/changelog/changelog.service';
import { NarrativeService } from 'integration/changelog/narrative.service';
import { MediaDisplay } from './MediaDisplay';
import { NarrativeElement } from './NarrativeElement';
import { RelatedEntriesList } from './RelatedEntriesList';
import { UserAvatar } from 'integration/ui/components/UserAvatar';

interface EntryDetailProps {
  entryId: string;
  onClose: () => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({
  entryId,
  onClose,
}) => {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'narrative' | 'related'>('details');
  const [editingNarrative, setEditingNarrative] = useState<boolean>(false);
  const [narrativeContent, setNarrativeContent] = useState<string>('');
  const [narrativeType, setNarrativeType] = useState<string>('context');
  
  const changelogService = new ChangelogService();
  const narrativeService = new NarrativeService();
  
  useEffect(() => {
    loadEntryData();
  }, [entryId]);
  
  const loadEntryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load the entry details
      const entryData = await changelogService.getChangelogEntry(entryId);
      setEntry(entryData);
      
      // Load related entries
      if (entryData.relatedChanges.length > 0) {
        const relatedData = await Promise.all(
          entryData.relatedChanges.map(id => 
            changelogService.getChangelogEntry(id)
          )
        );
        setRelatedEntries(relatedData.filter(Boolean));
      }
      
    } catch (err) {
      setError(`Failed to load entry data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNarrative = async () => {
    if (!entry || !narrativeContent.trim()) return;
    
    try {
      await narrativeService.addNarrativeElement(entryId, {
        type: narrativeType as any,
        content: narrativeContent,
        author: {
          // This would come from the current user
          id: 'current-user',
          name: 'Current User',
          avatar: '/assets/user-avatar.png'
        }
      });
      
      // Reload entry to get updated narrative elements
      loadEntryData();
      
      // Reset form
      setEditingNarrative(false);
      setNarrativeContent('');
    } catch (err) {
      setError(`Failed to add narrative: ${err.message}`);
    }
  };
  
  if (loading && !entry) {
    return (
      <div className="entry-detail loading">
        <div className="entry-loading-spinner" />
        <span>Loading entry details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="entry-detail error">
        <div className="entry-error-icon" />
        <span>{error}</span>
        <button onClick={loadEntryData}>Retry</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
  
  if (!entry) {
    return (
      <div className="entry-detail empty">
        <span>Entry not found</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
  
  return (
    <div className="entry-detail">
      <div className="entry-header">
        <div className={`entry-type-badge type-${entry.type}`}>
          {entry.type}
        </div>
        
        <h2>{entry.title}</h2>
        
        <div className="entry-meta">
          <div className="entry-author">
            <UserAvatar user={entry.author} size="small" />
            <span>{entry.author.name}</span>
          </div>
          
          <div className="entry-timestamp">
            {formatDate(entry.timestamp)}
          </div>
          
          <div className={`entry-significance significance-${entry.significance}`}>
            {entry.significance}
          </div>
        </div>
        
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="entry-tabs">
        <button 
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={activeTab === 'narrative' ? 'active' : ''}
          onClick={() => setActiveTab('narrative')}
        >
          Narrative
          <span className="badge">{entry.narrativeElements.length}</span>
        </button>
        <button 
          className={activeTab === 'related' ? 'active' : ''}
          onClick={() => setActiveTab('related')}
        >
          Related Changes
          <span className="badge">{relatedEntries.length}</span>
        </button>
      </div>
      
      <div className="entry-content">
        {activeTab === 'details' && (
          <>
            <div className="entry-description">
              <p>{entry.description}</p>
            </div>
            
            {entry.mediaElements.length > 0 && (
              <div className="entry-media">
                {entry.mediaElements.map(media => (
                  <MediaDisplay 
                    key={media.id}
                    media={media}
                  />
                ))}
              </div>
            )}
            
            {entry.tags.length > 0 && (
              <div className="entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'narrative' && (
          <div className="narrative-elements">
            {entry.narrativeElements.length > 0 ? (
              entry.narrativeElements.map(element => (
                <NarrativeElement 
                  key={element.id}
                  element={element}
                />
              ))
            ) : (
              <div className="empty-narrative">
                <p>No narrative elements yet.</p>
              </div>
            )}
            
            {editingNarrative ? (
              <div className="add-narrative-form">
                <select 
                  value={narrativeType}
                  onChange={e => setNarrativeType(e.target.value)}
                >
                  <option value="context">Context</option>
                  <option value="decision">Decision</option>
                  <option value="impact">Impact</option>
                  <option value="future">Future Direction</option>
                </select>
                
                <textarea
                  value={narrativeContent}
                  onChange={e => setNarrativeContent(e.target.value)}
                  placeholder="Add your narrative..."
                  rows={4}
                />
                
                <div className="form-actions">
                  <button onClick={() => setEditingNarrative(false)}>
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddNarrative}
                    disabled={!narrativeContent.trim()}
                  >
                    Add Narrative
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="add-narrative-button"
                onClick={() => setEditingNarrative(true)}
              >
                + Add Narrative Element
              </button>
            )}
          </div>
        )}
        
        {activeTab === 'related' && (
          <RelatedEntriesList 
            entries={relatedEntries}
            currentEntryId={entryId}
          />
        )}
      </div>
    </div>
  );
};

// Helper to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};
```

#### Document Health Score Component

```tsx
// integration/ui/components/DocumentHealthScore.tsx

import React, { useEffect, useState } from 'react';
import { DocumentHealthService } from 'integration/quality/document-health.service';

interface DocumentHealthScoreProps {
  documentId: string;
  showDetails?: boolean;
  onScoreClick?: () => void;
  className?: string;
}

export const DocumentHealthScore: React.FC<DocumentHealthScoreProps> = ({
  documentId,
  showDetails = false,
  onScoreClick,
  className,
}) => {
  const [healthScore, setHealthScore] = useState<DocumentHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const healthService = new DocumentHealthService();
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    healthService.calculateHealthScore(documentId)
      .then(score => {
        setHealthScore(score);
      })
      .catch(err => {
        console.error('Error calculating health score:', err);
        setError('Failed to calculate document health score');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [documentId]);
  
  // Helper to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };
  
  // Helper to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };
  
  if (loading) {
    return (
      <div className={`document-health-score loading ${className || ''}`}>
        <div className="score-spinner" />
        <span>Calculating health score...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`document-health-score error ${className || ''}`}>
        <div className="score-error-icon" />
        <span>{error}</span>
      </div>
    );
  }
  
  if (!healthScore) {
    return null;
  }
  
  return (
    <div className={`document-health-score ${className || ''}`}>
      <div 
        className="score-circle"
        style={{ 
          '--score-color': getScoreColor(healthScore.overallScore) 
        } as React.CSSProperties}
        onClick={onScoreClick}
      >
        <div className="score-value">{Math.round(healthScore.overallScore)}</div>
        <div className="score-label">{getScoreLabel(healthScore.overallScore)}</div>
      </div>
      
      {showDetails && (
        <div className="score-details">
          <div className="score-components">
            <div className="component">
              <span className="component-label">Coverage</span>
              <div 
                className="component-bar"
                style={{
                  width: `${healthScore.components.coverageScore}%`,
                  backgroundColor: getScoreColor(healthScore.components.coverageScore)
                }}
              />
              <span className="component-value">
                {Math.round(healthScore.components.coverageScore)}
              </span>
            </div>
            
            <div className="component">
              <span className="component-label">Quality</span>
              <div 
                className="component-bar"
                style={{
                  width: `${healthScore.components.qualityScore}%`,
                  backgroundColor: getScoreColor(healthScore.components.qualityScore)
                }}
              />
              <span className="component-value">
                {Math.round(healthScore.components.qualityScore)}
              </span>
            </div>
            
            <div className="component">
              <span className="component-label">Freshness</span>
              <div 
                className="component-bar"
                style={{
                  width: `${healthScore.components.freshnessScore}%`,
                  backgroundColor: getScoreColor(healthScore.components.freshnessScore)
                }}
              />
              <span className="component-value">
                {Math.round(healthScore.components.freshnessScore)}
              </span>
            </div>
          </div>
          
          {healthScore.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Recommendations</h4>
              <ul>
                {healthScore.recommendations.map((rec, index) => (
                  <li 
                    key={index} 
                    className={`recommendation priority-${rec.priority}`}
                  >
                    <span className="recommendation-message">{rec.message}</span>
                    <span className="recommendation-details">{rec.details}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Testing Approach

### Integration Testing Strategy

```typescript
// integration/tests/test-utils.ts

import { IDEProjectSystem } from 'ide-project/testing';
import { DocumentationSystem } from 'docs-system/testing';
import { IntegrationServices } from 'integration/services';

export class IntegrationTestEnvironment {
  private ideSystem: IDEProjectSystem;
  private docsSystem: DocumentationSystem;
  private integrationServices: IntegrationServices;
  
  constructor() {
    // Initialize IDE Project System with test configuration
    this.ideSystem = new IDEProjectSystem({
      useInMemoryDatabase: true,
      enableTestMode: true
    });
    
    // Initialize Documentation System with test configuration
    this.docsSystem = new DocumentationSystem({
      useInMemoryDatabase: true,
      enableTestMode: true
    });
    
    // Set up integration services
    this.integrationServices = new IntegrationServices({
      ideSystem: this.ideSystem,
      docsSystem: this.docsSystem,
      useTestMode: true
    });
  }
  
  async initialize() {
    // Start both systems
    await Promise.all([
      this.ideSystem.start(),
      this.docsSystem.start()
    ]);
    
    // Initialize integration services
    await this.integrationServices.initialize();
    
    return this;
  }
  
  async shutdown() {
    // Shut down integration services
    await this.integrationServices.shutdown();
    
    // Shut down both systems
    await Promise.all([
      this.ideSystem.shutdown(),
      this.docsSystem.shutdown()
    ]);
  }
  
  // Test helpers for creating test data
  async createTestProject() {
    const project = await this.ideSystem.createTestProject();
    // Integration will automatically create the documentation project
    return project;
  }
  
  async createTestResearch(projectId: string) {
    return this.ideSystem.createTestResearch(projectId);
  }
  
  async createTestDocument(projectId: string) {
    return this.docsSystem.createTestDocument(projectId);
  }
  
  // Test assertions for integration functionality
  async assertProjectSync(ideProjectId: string) {
    const ideProject = await this.ideSystem.getProject(ideProjectId);
    const docsProject = await this.docsSystem.getProjectByExternalId(ideProjectId);
    
    expect(docsProject).not.toBeNull();
    expect(docsProject.name).toBe(ideProject.name);
    expect(docsProject.description).toBe(ideProject.description);
  }
  
  async assertResearchDocumentLink(researchId: string, documentId: string) {
    const link = await this.integrationServices.researchDocLinking.getLink(
      researchId, 
      documentId
    );
    
    expect(link).not.toBeNull();
    expect(link.mapping.length).toBeGreaterThan(0);
  }
  
  // Additional test utilities...
}
```

### Sample Integration Tests

```typescript
// integration/tests/research-doc-linking.test.ts

import { IntegrationTestEnvironment } from './test-utils';

describe('Research to Documentation Linking', () => {
  let testEnv: IntegrationTestEnvironment;
  
  beforeAll(async () => {
    testEnv = await new IntegrationTestEnvironment().initialize();
  });
  
  afterAll(async () => {
    await testEnv.shutdown();
  });
  
  it('should create a document link when research is completed', async () => {
    // Create a test project
    const project = await testEnv.createTestProject();
    
    // Create test research
    const research = await testEnv.createTestResearch(project.id);
    
    // Mark research as complete
    await testEnv.ideSystem.completeResearch(research.id);
    
    // Wait for events to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify a document was created
    const documents = await testEnv.docsSystem.getDocumentsByProjectId(project.documentationProjectId);
    expect(documents.length).toBe(1);
    
    // Verify the link exists
    await testEnv.assertResearchDocumentLink(research.id, documents[0].id);
  });
  
  it('should update document when research is updated', async () => {
    // Create a test project
    const project = await testEnv.createTestProject();
    
    // Create test research and document
    const research = await testEnv.createTestResearch(project.id);
    const document = await testEnv.createTestDocument(project.documentationProjectId);
    
    // Link them
    await testEnv.integrationServices.researchDocLinking.linkResearchToDocument(
      research.id,
      document.id
    );
    
    // Update research
    const updateData = {
      sections: [
        {
          id: research.sections[0].id,
          content: 'Updated research content'
        }
      ]
    };
    await testEnv.ideSystem.updateResearch(research.id, updateData);
    
    // Wait for events to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get updated document
    const updatedDocument = await testEnv.docsSystem.getDocument(document.id);
    
    // Find the linked section in the document
    const link = await testEnv.integrationServices.researchDocLinking.getLink(
      research.id,
      document.id
    );
    
    const mappedSection = link.mapping.find(
      m => m.researchSectionId === research.sections[0].id
    );
    
    const documentSection = updatedDocument.sections.find(
      s => s.id === mappedSection.documentSectionId
    );
    
    // Verify the document section was updated
    expect(documentSection.content).toContain('Updated research content');
  });
  
  // Additional tests...
});
```

## Deployment Strategy

### Phased Deployment Approach

1. **Phase 1: Foundation Layer**
   - Deploy shared authentication
   - Deploy project synchronization
   - Deploy event system

2. **Phase 2: Core Integration**
   - Deploy research-doc linking
   - Deploy unified navigation

3. **Phase 3: Enhanced Features**
   - Deploy real-time collaboration
   - Deploy semantic search
   - Deploy document health score

### Feature Flag Configuration

```typescript
// integration/config/feature-flags.ts

export const FeatureFlags = {
  // Foundation Layer
  SHARED_AUTH: {
    enabled: true,
    description: 'Unified authentication across systems',
    rolloutPercentage: 100
  },
  PROJECT_SYNC: {
    enabled: true,
    description: 'Synchronization of project data',
    rolloutPercentage: 100
  },
  EVENT_SYSTEM: {
    enabled: true,
    description: 'Cross-system event propagation',
    rolloutPercentage: 100
  },
  
  // Core Integration
  RESEARCH_DOC_LINKING: {
    enabled: true,
    description: 'Linking between research and documentation',
    rolloutPercentage: 75
  },
  UNIFIED_NAVIGATION: {
    enabled: true,
    description: 'Seamless navigation between systems',
    rolloutPercentage: 75
  },
  
  // Enhanced Features
  COLLABORATION_HEATMAP: {
    enabled: false,
    description: 'Real-time collaboration visualization',
    rolloutPercentage: 0
  },
  SEMANTIC_SEARCH: {
    enabled: false,
    description: 'Unified semantic search',
    rolloutPercentage: 0
  },
  DOCUMENT_HEALTH: {
    enabled: false,
    description: 'AI-powered document health scoring',
    rolloutPercentage: 0
  }
};

export function isFeatureEnabled(feature: keyof typeof FeatureFlags, userId?: string): boolean {
  const flag = FeatureFlags[feature];
  
  // Feature not configured
  if (!flag) return false;
  
  // Feature explicitly disabled
  if (!flag.enabled) return false;
  
  // Feature fully enabled
  if (flag.rolloutPercentage >= 100) return true;
  
  // Gradual rollout based on user ID
  if (userId && flag.rolloutPercentage > 0) {
    // Deterministic hashing of user ID for consistent feature availability
    const hash = hashString(userId);
    const normalizedHash = hash % 100;
    return normalizedHash < flag.rolloutPercentage;
  }
  
  return false;
}

// Simple string hashing function
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
```

## Implementation Sequence

The implementation will follow this sequence:

1. **Week 1-2: Project Setup and Foundation Layer**
   - Set up integration repository
   - Implement shared authentication
   - Implement project synchronization
   - Implement event system
   - Write integration tests for foundation layer

2. **Week 3-4: Core Integration Layer**
   - Implement research-doc linking service
   - Implement unified navigation
   - Implement shared UI components
   - Write integration tests for core layer

3. **Week 5-6: Enhanced Features (Part 1)**
   - Implement real-time collaboration heatmap
   - Design and develop UI components
   - Write integration tests for collaboration feature

4. **Week 7-8: Enhanced Features (Part 2)**
   - Implement semantic search service
   - Implement document health score service
   - Design and develop UI components
   - Write integration tests for remaining features

5. **Week 9-10: Testing and Refinement**
   - Comprehensive integration testing
   - Performance optimization
   - Bug fixes and refinements
   - Documentation updates

6. **Week 11-12: Deployment and Monitoring**
   - Staged deployment with feature flags
   - Monitoring implementation
   - User feedback collection
   - Final adjustments

## Next Steps

1. Set up integration development environment
2. Create shared repository structure
3. Implement foundation layer components
4. Develop initial integration tests
5. Begin development of core integration layer