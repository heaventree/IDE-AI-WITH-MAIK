#!/bin/bash

# IDE-Docs Integration Installer
# This script installs the IDE-Docs Integration system

echo "=== IDE-Docs Integration System Installer ==="
echo "Starting installation process..."

# Function to check prerequisites
check_prerequisites() {
  echo "Checking prerequisites..."
  
  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed"
    echo "Please install Node.js 18 or higher and try again"
    exit 1
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18 or higher is required"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js and try again"
    exit 1
  fi
  
  # Check for npm
  if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not installed"
    exit 1
  fi
  
  # Check for Python
  if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed"
    exit 1
  fi
  
  echo "All prerequisites satisfied!"
}

# Function to install dependencies
install_dependencies() {
  echo "Installing dependencies..."
  
  # Install documentation system dependencies
  cd docs-system
  npm install --production
  cd ..
  
  echo "Dependencies installed successfully!"
}

# Function to configure the system
configure_system() {
  echo "Configuring system..."
  
  # Create configuration directory if it doesn't exist
  mkdir -p config
  
  # Create default configuration file if it doesn't exist
  if [ ! -f config/config.json ]; then
    cat > config/config.json << 'CONFIGEOF'
{
  "server": {
    "port": 5000,
    "host": "0.0.0.0"
  },
  "features": {
    "realTimeCollaboration": true,
    "documentHealthScore": true,
    "visualChangelog": true,
    "intelligentSearch": true
  },
  "security": {
    "authEnabled": true,
    "sessionTimeout": 3600
  }
}
CONFIGEOF
    echo "Default configuration created"
  else
    echo "Using existing configuration"
  fi
}

# Function to create startup script
create_startup_script() {
  echo "Creating startup script..."
  
  cat > start-system.sh << 'STARTEOF'
#!/bin/bash

# Start the IDE-Docs Integration System
echo "Starting IDE-Docs Integration System..."

# Start the documentation server
cd docs-system
node index.js &
DOCS_PID=$!

echo "Documentation System started with PID: $DOCS_PID"
echo "You can access the system at: http://localhost:5000"
echo "Press Ctrl+C to stop all services"

# Handle graceful shutdown
trap "kill $DOCS_PID; echo 'Shutting down services...'; exit" INT TERM

# Wait for processes
wait
STARTEOF

  chmod +x start-system.sh
  echo "Startup script created successfully!"
}

# Function to verify installation
verify_installation() {
  echo "Verifying installation..."
  
  # Check if main directories exist
  if [ ! -d "docs-system" ] || [ ! -d "integration-docs" ]; then
    echo "Error: Installation appears to be incomplete"
    exit 1
  fi
  
  # Check if configuration file exists
  if [ ! -f "config/config.json" ]; then
    echo "Error: Configuration file is missing"
    exit 1
  fi
  
  # Check if startup script exists
  if [ ! -f "start-system.sh" ]; then
    echo "Error: Startup script is missing"
    exit 1
  fi
  
  echo "Installation verified successfully!"
}

# Main installation process
main() {
  echo "Beginning installation process..."
  
  check_prerequisites
  install_dependencies
  configure_system
  create_startup_script
  verify_installation
  
  echo ""
  echo "=== Installation Complete! ==="
  echo "To start the system, run: ./start-system.sh"
  echo "The documentation system will be available at: http://localhost:5000"
}

# Start the installation
main
