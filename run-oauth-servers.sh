#!/bin/bash

# OAuth Servers Runner Script
# This script runs multiple OAuth servers concurrently using bun

set -e  # Exit on any error

echo "🚀 Starting OAuth servers with bun..."
echo "📊 Debug mode: express:*"
echo ""

# Check if required files exist
required_files=(
    "authorizationServer.js"
    "client.js" 
    "protectedResource.js"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Error: $file not found in current directory"
        echo "💡 Make sure you're in the directory containing your OAuth server files"
        exit 1
    fi
done

echo "✅ All required files found"
echo ""

# Set debug environment variable and run servers concurrently
DEBUG=express:* bunx concurrently \
    "bun --watch authorizationServer.js" \
    "bun --watch client.js" \
    "bun --watch protectedResource.js" \
    --names "AUTH,CLIENT,RESOURCE" \
    --prefix-colors "cyan,magenta,yellow" \
    --kill-others-on-fail
