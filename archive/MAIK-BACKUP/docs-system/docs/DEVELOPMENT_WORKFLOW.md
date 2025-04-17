# MAIK-AI-CODING-APP - Development Workflow

## Development Environment

### Prerequisites

- Node.js 18+ and npm 8+
- Git
- Replit account (for deployment)
- API keys for OpenAI (GPT-4)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/maik-ai/coding-app.git && cd coding-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env && nano .env  # Edit with your API keys

# Start development server
npm run dev
