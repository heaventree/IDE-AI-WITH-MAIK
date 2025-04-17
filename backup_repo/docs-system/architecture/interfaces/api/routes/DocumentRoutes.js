/**
 * Document Routes
 * 
 * API routes for documents.
 */

const express = require('express');
const ApiResponse = require('../ApiResponse');

/**
 * Create document routes
 * 
 * @param {Object} dependencies - Dependencies
 * @returns {express.Router} Router
 */
function createDocumentRoutes(dependencies) {
  const {
    logger,
    useCases: {
      createDocumentUseCase,
      publishDocumentUseCase,
      searchDocumentsUseCase
    }
  } = dependencies;
  
  const router = express.Router();
  
  /**
   * @swagger
   * /api/documents:
   *   get:
   *     summary: Search documents
   *     description: Search for documents with various filters
   *     tags: [Documents]
   *     parameters:
   *       - name: ownerID
   *         in: query
   *         schema:
   *           type: string
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [draft, published, archived]
   *       - name: tag
   *         in: query
   *         schema:
   *           type: string
   *       - name: query
   *         in: query
   *         schema:
   *           type: string
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 20
   *       - name: offset
   *         in: query
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: A list of documents
   */
  router.get('/', async (req, res, next) => {
    try {
      const query = {
        ownerId: req.query.ownerId || req.user.id,
        status: req.query.status,
        tag: req.query.tag,
        searchQuery: req.query.query,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
      };
      
      const result = await searchDocumentsUseCase.execute(query);
      
      res.set('X-Total-Count', result.totalCount.toString());
      
      return res.json(ApiResponse.paginated(
        result.documents,
        result.totalCount,
        result.limit,
        result.offset
      ));
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * @swagger
   * /api/documents:
   *   post:
   *     summary: Create a document
   *     description: Create a new document
   *     tags: [Documents]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: The created document
   */
  router.post('/', async (req, res, next) => {
    try {
      const command = {
        title: req.body.title,
        ownerId: req.user.id,
        content: req.body.content,
        tags: req.body.tags,
        metadata: req.body.metadata
      };
      
      const document = await createDocumentUseCase.execute(command);
      
      return res.status(201).json(ApiResponse.success(document));
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * @swagger
   * /api/documents/{id}:
   *   get:
   *     summary: Get a document
   *     description: Get a document by its ID
   *     tags: [Documents]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *       - name: version
   *         in: query
   *         schema:
   *           type: integer
   *       - name: includeContent
   *         in: query
   *         schema:
   *           type: boolean
   *           default: false
   *     responses:
   *       200:
   *         description: The document
   *       404:
   *         description: Document not found
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const query = {
        documentId: req.params.id,
        version: req.query.version ? parseInt(req.query.version, 10) : null,
        includeContent: req.query.includeContent === 'true'
      };
      
      // For now, we'll re-use the searchDocumentUseCase to find the document
      // In a real implementation, we would have a getDocumentUseCase
      const documents = await searchDocumentsUseCase.execute({
        documentId: query.documentId
      });
      
      if (documents.documents.length === 0) {
        return res.status(404).json(ApiResponse.notFound('document', query.documentId));
      }
      
      // TODO: Handle version and includeContent
      
      return res.json(ApiResponse.success(documents.documents[0]));
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * @swagger
   * /api/documents/{id}/publish:
   *   post:
   *     summary: Publish a document
   *     description: Publish a document
   *     tags: [Documents]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               environment:
   *                 type: string
   *                 default: production
   *     responses:
   *       200:
   *         description: The published document
   *       404:
   *         description: Document not found
   */
  router.post('/:id/publish', async (req, res, next) => {
    try {
      const command = {
        documentId: req.params.id,
        userId: req.user.id,
        environment: req.body.environment || 'production'
      };
      
      const document = await publishDocumentUseCase.execute(command);
      
      return res.json(ApiResponse.success(document));
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}

module.exports = { createDocumentRoutes };