# Aala Computer - Production Server Startup Script
# This script ensures the server connects to MongoDB Atlas

Write-Host "`n=== Aala Computer Server Startup ===" -ForegroundColor Cyan
Write-Host "Setting up environment variables..." -ForegroundColor Yellow

# Set MongoDB Atlas connection
$env:MONGO_URI = "mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority"
$env:PORT = "10000"

Write-Host "✓ MongoDB Atlas configured" -ForegroundColor Green
Write-Host "✓ Port set to 10000" -ForegroundColor Green
Write-Host "`nStarting backend server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

# Start the server
node backend/index.cjs
