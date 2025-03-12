#!/bin/bash
echo "Starting ThreatLightHouse Application..."
echo ""
echo "Starting Python backend server..."
python api/app.py &
backend_pid=$!
echo ""
echo "Starting React frontend server..."
npm start &
frontend_pid=$!
echo ""
echo "ThreatLightHouse components started. Access the application at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $backend_pid $frontend_pid; exit" INT TERM EXIT

wait
