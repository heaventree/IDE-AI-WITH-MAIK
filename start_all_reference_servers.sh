#!/bin/bash

# Set Node.js environment
export NODE_ENV=development

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      Starting Bolt DIY Reference Servers           ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Start both servers in the background
echo -e "${GREEN}Starting bolt_reference server on port 5001...${NC}"
node bolt_reference/server.js > bolt_reference_server.log 2>&1 &
BOLT_REF_PID=$!

echo -e "${GREEN}Starting main reference server on port 5002...${NC}"
node reference_server/server.js > main_reference_server.log 2>&1 &
MAIN_REF_PID=$!

# Function to handle graceful shutdown
function cleanup {
  echo -e "${YELLOW}Shutting down servers...${NC}"
  kill $BOLT_REF_PID $MAIN_REF_PID 2>/dev/null
  exit 0
}

# Register cleanup function for signals
trap cleanup SIGINT SIGTERM

# Display info
echo -e "${GREEN}Servers running:${NC}"
echo -e "  - Bolt Reference:  ${BLUE}http://localhost:5001${NC}"
echo -e "  - Main Reference:  ${BLUE}http://localhost:5002${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep script running until Ctrl+C
while true; do
  sleep 1
done