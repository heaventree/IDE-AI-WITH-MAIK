/**
 * Authorization Module for Documentation System
 * 
 * This module provides role-based access control (RBAC) functionality
 * for controlling user permissions and access to resources.
 */

/**
 * Authorization class for managing user roles and permissions
 */
class Authorization {
  /**
   * Create a new Authorization instance
   * @param {Object} [options] - Configuration options
   * @param {Array} [options.roles] - Predefined roles
   * @param {Array} [options.permissions] - Predefined permissions
   * @param {Function} [options.logger] - Logging function
   */
  constructor(options = {}) {
    // Define roles and their permissions
    this.roles = options.roles || {
      admin: {
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['*'] // Wildcard for all permissions
      },
      manager: {
        name: 'Manager',
        description: 'Management access',
        permissions: [
          'docs:create', 'docs:read', 'docs:update', 'docs:delete',
          'users:read', 'templates:*', 'reports:*', 'workflows:*'
        ]
      },
      editor: {
        name: 'Editor',
        description: 'Edit access to documentation',
        permissions: [
          'docs:create', 'docs:read', 'docs:update',
          'templates:read', 'templates:use', 'workflows:read'
        ]
      },
      reviewer: {
        name: 'Reviewer',
        description: 'Review access to documentation',
        permissions: [
          'docs:read', 'docs:comment', 'workflows:read'
        ]
      },
      viewer: {
        name: 'Viewer',
        description: 'Read-only access',
        permissions: [
          'docs:read'
        ]
      }
    };

    // Define all available permissions
    this.permissions = options.permissions || {
      // Document permissions
      'docs:create': 'Create new documents',
      'docs:read': 'Read documents',
      'docs:update': 'Update existing documents',
      'docs:delete': 'Delete documents',
      'docs:comment': 'Comment on documents',
      'docs:publish': 'Publish documents',
      'docs:archive': 'Archive documents',
      
      // Template permissions
      'templates:create': 'Create new templates',
      'templates:read': 'View templates',
      'templates:update': 'Update existing templates',
      'templates:delete': 'Delete templates',
      'templates:use': 'Use templates',
      
      // User permissions
      'users:create': 'Create users',
      'users:read': 'View user information',
      'users:update': 'Update user information',
      'users:delete': 'Delete users',
      
      // Workflow permissions
      'workflows:create': 'Create workflows',
      'workflows:read': 'View workflows',
      'workflows:update': 'Update workflows',
      'workflows:delete': 'Delete workflows',
      'workflows:execute': 'Execute workflows',
      
      // Report permissions
      'reports:create': 'Create reports',
      'reports:read': 'View reports',
      'reports:export': 'Export reports',
      
      // System permissions
      'system:settings': 'Modify system settings',
      'system:logs': 'View system logs',
      'system:backup': 'Perform system backups',
      'system:restore': 'Restore from backups'
    };

    // Set up logger
    this.logger = options.logger || console;
    
    // Custom role assignments
    this.customRoleAssignments = {};
  }
  
  /**
   * Check if a user has a specific permission
   * @param {Object} user - User object
   * @param {string} permission - Permission to check
   * @returns {boolean} Whether the user has the permission
   */
  hasPermission(user, permission) {
    if (!user || !permission) {
      return false;
    }
    
    // Get user roles
    const userRoles = this.getUserRoles(user);
    
    // Check each role for the permission
    for (const roleName of userRoles) {
      const role = this.roles[roleName];
      
      if (!role) {
        continue;
      }
      
      // Check if role has wildcard permission
      if (role.permissions.includes('*')) {
        return true;
      }
      
      // Check permission wildcards (e.g., 'docs:*' matches 'docs:read')
      const permissionCategory = permission.split(':')[0];
      if (role.permissions.includes(`${permissionCategory}:*`)) {
        return true;
      }
      
      // Check specific permission
      if (role.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if a user has all specified permissions
   * @param {Object} user - User object
   * @param {Array} permissions - Array of permissions to check
   * @returns {boolean} Whether the user has all permissions
   */
  hasAllPermissions(user, permissions) {
    if (!Array.isArray(permissions)) {
      return this.hasPermission(user, permissions);
    }
    
    return permissions.every(permission => this.hasPermission(user, permission));
  }
  
  /**
   * Check if a user has any of the specified permissions
   * @param {Object} user - User object
   * @param {Array} permissions - Array of permissions to check
   * @returns {boolean} Whether the user has any of the permissions
   */
  hasAnyPermission(user, permissions) {
    if (!Array.isArray(permissions)) {
      return this.hasPermission(user, permissions);
    }
    
    return permissions.some(permission => this.hasPermission(user, permission));
  }
  
  /**
   * Get all permissions for a user
   * @param {Object} user - User object
   * @returns {Array} Array of permission strings
   */
  getUserPermissions(user) {
    if (!user) {
      return [];
    }
    
    // Get user roles
    const userRoles = this.getUserRoles(user);
    
    // Collect permissions from all roles
    const permissions = new Set();
    
    for (const roleName of userRoles) {
      const role = this.roles[roleName];
      
      if (!role) {
        continue;
      }
      
      // If role has wildcard, return all permissions
      if (role.permissions.includes('*')) {
        return Object.keys(this.permissions);
      }
      
      // Add role permissions
      for (const permission of role.permissions) {
        // Handle wildcards (e.g., 'docs:*')
        if (permission.endsWith(':*')) {
          const category = permission.split(':')[0];
          
          // Add all permissions in this category
          Object.keys(this.permissions).forEach(p => {
            if (p.startsWith(`${category}:`)) {
              permissions.add(p);
            }
          });
        } else {
          permissions.add(permission);
        }
      }
    }
    
    return Array.from(permissions);
  }
  
  /**
   * Get the roles assigned to a user
   * @param {Object} user - User object
   * @returns {Array} Array of role names
   */
  getUserRoles(user) {
    if (!user) {
      return [];
    }
    
    // Check for custom role assignments first
    if (user.id && this.customRoleAssignments[user.id]) {
      return [...this.customRoleAssignments[user.id]];
    }
    
    // Use roles from user object
    const roles = user.roles || [];
    return Array.isArray(roles) ? roles : [roles];
  }
  
  /**
   * Assign custom roles to a user
   * @param {string} userId - User identifier
   * @param {Array} roles - Array of role names
   * @returns {Array} Updated roles for the user
   */
  assignRoles(userId, roles) {
    if (!userId || !Array.isArray(roles)) {
      throw new Error('Invalid userId or roles array');
    }
    
    // Validate roles
    for (const role of roles) {
      if (!this.roles[role]) {
        throw new Error(`Invalid role: ${role}`);
      }
    }
    
    // Assign roles
    this.customRoleAssignments[userId] = [...roles];
    
    this.logger.info(`Assigned roles to user ${userId}:`, roles);
    
    return this.customRoleAssignments[userId];
  }
  
  /**
   * Remove roles from a user
   * @param {string} userId - User identifier
   * @param {Array} roles - Array of role names to remove (or all if not specified)
   * @returns {Array} Updated roles for the user
   */
  removeRoles(userId, roles) {
    if (!userId) {
      throw new Error('Invalid userId');
    }
    
    // If no custom roles assigned, return empty array
    if (!this.customRoleAssignments[userId]) {
      return [];
    }
    
    // If no roles specified, remove all custom roles
    if (!roles) {
      delete this.customRoleAssignments[userId];
      return [];
    }
    
    // Remove specific roles
    this.customRoleAssignments[userId] = this.customRoleAssignments[userId]
      .filter(role => !roles.includes(role));
    
    this.logger.info(`Removed roles from user ${userId}:`, roles);
    
    return this.customRoleAssignments[userId];
  }
  
  /**
   * Create a new role
   * @param {string} roleName - Role identifier
   * @param {Object} roleDetails - Role details
   * @param {string} roleDetails.name - Human-readable name
   * @param {string} roleDetails.description - Role description
   * @param {Array} roleDetails.permissions - Array of permissions
   * @returns {Object} Created role
   */
  createRole(roleName, roleDetails) {
    if (!roleName || !roleDetails) {
      throw new Error('Role name and details are required');
    }
    
    if (this.roles[roleName]) {
      throw new Error(`Role ${roleName} already exists`);
    }
    
    // Validate permissions
    if (Array.isArray(roleDetails.permissions)) {
      for (const permission of roleDetails.permissions) {
        if (permission !== '*' && !permission.endsWith(':*') && !this.permissions[permission]) {
          throw new Error(`Invalid permission: ${permission}`);
        }
      }
    }
    
    // Create role
    this.roles[roleName] = {
      name: roleDetails.name || roleName,
      description: roleDetails.description || '',
      permissions: roleDetails.permissions || []
    };
    
    this.logger.info(`Created role: ${roleName}`, this.roles[roleName]);
    
    return this.roles[roleName];
  }
  
  /**
   * Update an existing role
   * @param {string} roleName - Role identifier
   * @param {Object} roleDetails - Updated role details
   * @returns {Object} Updated role
   */
  updateRole(roleName, roleDetails) {
    if (!roleName || !this.roles[roleName]) {
      throw new Error(`Role ${roleName} does not exist`);
    }
    
    // Update role properties
    if (roleDetails.name) {
      this.roles[roleName].name = roleDetails.name;
    }
    
    if (roleDetails.description) {
      this.roles[roleName].description = roleDetails.description;
    }
    
    if (Array.isArray(roleDetails.permissions)) {
      // Validate permissions
      for (const permission of roleDetails.permissions) {
        if (permission !== '*' && !permission.endsWith(':*') && !this.permissions[permission]) {
          throw new Error(`Invalid permission: ${permission}`);
        }
      }
      
      this.roles[roleName].permissions = [...roleDetails.permissions];
    }
    
    this.logger.info(`Updated role: ${roleName}`, this.roles[roleName]);
    
    return this.roles[roleName];
  }
  
  /**
   * Delete a role
   * @param {string} roleName - Role identifier
   * @returns {boolean} Whether the role was deleted
   */
  deleteRole(roleName) {
    if (!roleName || !this.roles[roleName]) {
      return false;
    }
    
    // Don't allow deleting built-in roles
    if (['admin', 'manager', 'editor', 'reviewer', 'viewer'].includes(roleName)) {
      throw new Error(`Cannot delete built-in role: ${roleName}`);
    }
    
    delete this.roles[roleName];
    
    // Remove this role from any custom role assignments
    for (const userId in this.customRoleAssignments) {
      this.customRoleAssignments[userId] = this.customRoleAssignments[userId]
        .filter(role => role !== roleName);
    }
    
    this.logger.info(`Deleted role: ${roleName}`);
    
    return true;
  }
  
  /**
   * Get a specific role
   * @param {string} roleName - Role identifier
   * @returns {Object|null} Role object or null if not found
   */
  getRole(roleName) {
    return this.roles[roleName] || null;
  }
  
  /**
   * Get all roles
   * @returns {Object} All roles
   */
  getAllRoles() {
    return { ...this.roles };
  }
  
  /**
   * Create a new permission
   * @param {string} permission - Permission identifier
   * @param {string} description - Permission description
   * @returns {Object} Created permission
   */
  createPermission(permission, description) {
    if (!permission) {
      throw new Error('Permission identifier is required');
    }
    
    if (this.permissions[permission]) {
      throw new Error(`Permission ${permission} already exists`);
    }
    
    this.permissions[permission] = description || '';
    
    this.logger.info(`Created permission: ${permission}`, description);
    
    return { [permission]: description };
  }
  
  /**
   * Delete a permission
   * @param {string} permission - Permission identifier
   * @returns {boolean} Whether the permission was deleted
   */
  deletePermission(permission) {
    if (!permission || !this.permissions[permission]) {
      return false;
    }
    
    delete this.permissions[permission];
    
    // Remove this permission from any roles
    for (const roleName in this.roles) {
      this.roles[roleName].permissions = this.roles[roleName].permissions
        .filter(p => p !== permission);
    }
    
    this.logger.info(`Deleted permission: ${permission}`);
    
    return true;
  }
  
  /**
   * Get all permissions
   * @returns {Object} All permissions
   */
  getAllPermissions() {
    return { ...this.permissions };
  }
  
  /**
   * Authorization middleware for Express.js
   * @param {string|Array} requiredPermissions - Required permissions
   * @param {Object} [options] - Options
   * @param {boolean} [options.requireAll=true] - Whether all permissions are required
   * @returns {Function} Express middleware function
   */
  middleware(requiredPermissions, options = {}) {
    const requireAll = options.requireAll !== false;
    
    return (req, res, next) => {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      let hasPermission;
      
      if (requireAll) {
        hasPermission = this.hasAllPermissions(req.user, requiredPermissions);
      } else {
        hasPermission = this.hasAnyPermission(req.user, requiredPermissions);
      }
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
      }
      
      next();
    };
  }
}

module.exports = Authorization;