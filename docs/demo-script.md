# AgentMD Demo Script (30-60 seconds)

## Setup
1. Open terminal in a clean directory
2. Set terminal font size to 14-16pt for readability
3. Resize window to 1200x600 pixels
4. Clear terminal: `clear`

## Demo Commands (copy-paste these)

```bash
# Step 1: Install AgentMD CLI
echo "🚀 Installing AgentMD CLI..."
npm install -g @agentmd-dev/cli

# Step 2: Create sample AGENTS.md
echo "📝 Creating sample AGENTS.md..."
cat > AGENTS.md << 'EOF'
---
name: "My AI Agent"
description: "Example agent for demo"
purpose: "Demonstrate AgentMD capabilities"
---

## Build
\`echo "Building application..."\`
\`npm run build\`

## Test  
\`echo "Running tests..."\`
\`npm test\`

## Deploy
\`echo "Deploying to production..."\`
\`npm run deploy\`
EOF

# Step 3: Check and score AGENTS.md
echo "🔍 Validating AGENTS.md..."
agentmd check . --score

# Step 4: Show dry-run execution
echo "⚡ Planning execution (dry run)..."
agentmd run . --dry-run

# Step 5: Show help
echo "📖 Available commands..."
agentmd --help
```

## Recording Tips
- **Start recording** before running first command
- **Type slowly** and deliberately
- **Wait 2-3 seconds** after each command completes
- **Highlight results** with mouse if possible
- **Total duration**: 45-60 seconds

## After Recording
1. Save as `assets/demo.gif`
2. Test in README locally
3. Keep file under 2MB
