#!/bin/bash

# Set Node.js environment
export NODE_ENV=development

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      Starting Bolt DIY Reference Server            ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Change to reference directory and start server
echo -e "${GREEN}Starting reference server on port 5001...${NC}"
node bolt_reference/server.js