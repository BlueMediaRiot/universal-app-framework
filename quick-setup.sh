#!/bin/bash

# Universal App Framework - Quick Setup
# This script sets up the folder structure for the interactive workflow

echo "🚀 Setting up Universal App Framework for Antigravity..."
echo ""

# Create .antigravity structure
echo "📁 Creating .antigravity folder structure..."
mkdir -p .antigravity/workflows
mkdir -p .antigravity/rules
mkdir -p .antigravity/knowledge

# Check if workflow files exist in current directory or outputs
if [ -f "setup-framework.md" ]; then
    echo "✓ Found setup-framework.md"
    cp setup-framework.md .antigravity/workflows/
elif [ -f "outputs/setup-framework.md" ]; then
    echo "✓ Found setup-framework.md in outputs/"
    cp outputs/setup-framework.md .antigravity/workflows/
else
    echo "⚠️  setup-framework.md not found (you'll need to add it manually)"
fi

if [ -f "setup-framework-workflow.md" ]; then
    cp setup-framework-workflow.md .antigravity/workflows/
elif [ -f "outputs/setup-framework-workflow.md" ]; then
    cp outputs/setup-framework-workflow.md .antigravity/workflows/
fi

# Create .gitkeep files to preserve empty directories
touch .antigravity/rules/.gitkeep
touch .antigravity/knowledge/.gitkeep

echo ""
echo "✅ Antigravity structure ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open this project in Antigravity:"
echo "   agy open ."
echo ""
echo "2. In Antigravity, say one of:"
echo "   • 'Start the framework setup workflow'"
echo "   • 'Let's set up the Universal App Framework'"
echo "   • 'I'm ready to begin the interactive setup'"
echo ""
echo "3. I'll guide you through each phase!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For more info, see START-HERE.md"
echo ""
