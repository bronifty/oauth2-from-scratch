#!/bin/bash
# chmod +x stop-servers.sh
# Kill all processes on React Router OAuth2 app ports
echo "Stopping all processes on ports 3000, 4000, and 4001..."

# Web app (React Router) - Port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Killing processes on port 3000 (Web app)..."
    lsof -ti:3000 | xargs kill -9
    echo "✓ Port 3000 cleared"
else
    echo "- No process found on port 3000"
fi

# API (Resource Server) - Port 4000
if lsof -ti:4000 > /dev/null 2>&1; then
    echo "Killing processes on port 4000 (API/Resource Server)..."
    lsof -ti:4000 | xargs kill -9
    echo "✓ Port 4000 cleared"
else
    echo "- No process found on port 4000"
fi

# IdP (Authorization Server) - Port 4001
if lsof -ti:4001 > /dev/null 2>&1; then
    echo "Killing processes on port 4001 (IdP/Authorization Server)..."
    lsof -ti:4001 | xargs kill -9
    echo "✓ Port 4001 cleared"
else
    echo "- No process found on port 4001"
fi

echo "All OAuth2 app processes stopped!"