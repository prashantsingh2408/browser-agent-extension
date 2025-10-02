#!/bin/bash

# Start Memory Agent as Web App
echo "🌐 Starting Memory Agent Web App..."
echo ""
echo "📱 Opening http://localhost:8000"
echo ""
echo "✨ Features available:"
echo "   ✅ All Memory Agent features"
echo "   ✅ Same code as extension"
echo "   ✅ Works in any browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start server
python3 -m http.server 8000

