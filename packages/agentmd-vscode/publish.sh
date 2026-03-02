#!/bin/bash

# VS Code Extension Publishing Guide
# Step-by-step instructions for publishing AgentMD extension

echo "🚀 Starting VS Code Extension Publishing Process..."

# Step 1: Clean build
echo "📦 Cleaning previous build..."
rm -rf dist
rm -rf *.vsix

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm install

# Step 3: Build extension
echo "🔨 Building extension..."
npm run build

# Step 4: Package extension (simplified)
echo "📦 Packaging extension..."
npx @vscode/vsce package --no-dependencies

# Step 5: Check result
if [ -f "*.vsix" ]; then
    echo "✅ Extension packaged successfully!"
    ls -la *.vsix
    echo ""
    echo "📝 Next steps:"
    echo "1. Test the extension: code --install-extension *.vsix"
    echo "2. Publish to marketplace: npx @vscode/vsce publish"
    echo "3. Or create PR for review"
else
    echo "❌ Packaging failed!"
    exit 1
fi
