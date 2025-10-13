#!/bin/bash

# Start both backend and frontend for development

echo "🚀 Starting FloAlly development servers..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Run this script from the floally-mvp directory"
    exit 1
fi

# Start backend in background
cd backend
source venv/bin/activate
echo "Starting backend on http://localhost:8000..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
echo "Starting frontend on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ FloAlly is running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
