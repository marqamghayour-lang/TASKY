#!/bin/bash

# Find local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="127.0.0.1"
fi

echo "=============================================="
echo "          STARTING TASKFLOW FULLSTACK         "
echo "=============================================="
echo "Local IP detected: $LOCAL_IP"
echo ""

# Terminate existing backend and frontend on standard ports (5000 and 5173) if running
echo "Checking for processes on ports 5000 and 5173..."
fuser -k 5000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# Set directory variables
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Start backend
echo "Starting Flask Backend on port 5000..."
cd "$BACKEND_DIR"
./venv/bin/python app.py > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Start frontend
echo "Starting React Frontend on port 5173..."
cd "$FRONTEND_DIR"
npm run dev -- --host > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait 3 seconds for servers to initialize
sleep 3

echo ""
echo "=============================================="
echo "               APP IS RUNNING                 "
echo "=============================================="
echo "🟢 Backend API running at:"
echo "   - Local:      http://localhost:5000/api/todos"
echo "   - Direct IP:  http://${LOCAL_IP}:5000/api/todos"
echo ""
echo "🟢 React Frontend running at:"
echo "   - Local:      http://localhost:5173/"
echo "   - Direct IP:  http://${LOCAL_IP}:5173/"
echo "=============================================="
echo "Check logs: "
echo "   - Backend:  tail -f backend.log"
echo "   - Frontend: tail -f frontend.log"
echo ""
echo "To stop the servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo "=============================================="

# Keep script running to monitor PIDs and allow ctrl+c cleanup
trap 'echo -e "\nStopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit 0' INT TERM
wait
