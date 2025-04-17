#!/bin/bash

# Verification script for IDE-Docs Integration

echo "Verifying IDE-Docs Integration installation..."

# Check if main directories exist
if [ ! -d "docs-system" ] || [ ! -d "integration-docs" ]; then
  echo "Error: Main directories are missing"
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Warning: Node.js version is below recommended (18+)"
  echo "Current version: $(node -v)"
fi

# Check if configuration exists
if [ ! -d "config" ] || [ ! -f "config/config.json" ]; then
  echo "Error: Configuration is missing"
  exit 1
fi

# Check if startup script exists
if [ ! -f "start-system.sh" ]; then
  echo "Error: Startup script is missing"
  exit 1
fi

# Check for documentation system files
if [ ! -f "docs-system/index.js" ] || [ ! -f "docs-system/index.html" ]; then
  echo "Error: Documentation system files are missing"
  exit 1
fi

# Check for integration documentation
if [ ! -f "integration-docs/README.md" ]; then
  echo "Error: Integration documentation is missing"
  exit 1
fi

echo "All checks passed! Your installation appears to be valid."
echo "You can start the system with: ./start-system.sh"
