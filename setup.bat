@echo off
REM ═══════════════════════════════════════════════════════════════════════
REM  PlaceNova - Quick Setup Script (Windows)
REM ═══════════════════════════════════════════════════════════════════════

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║       PlaceNova - Setting up your project       ║
echo  ╚══════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   ✓ Node.js %NODE_VERSION% found

REM Check MongoDB
echo [2/5] Checking MongoDB...
where mongod >nul 2>&1
if errorlevel 1 (
    echo   ⚠ MongoDB not found. Make sure MongoDB is installed and running
    echo   ⚠ Or use Docker: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=adminpassword mongo:7.0
) else (
    echo   ✓ MongoDB found
)

REM Install Backend Dependencies
echo [3/5] Installing backend dependencies...
cd /d "%~dp0backend"
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo   ❌ Backend npm install failed
        pause
        exit /b 1
    )
) else (
    echo   ✓ Backend dependencies already installed
)

REM Install Frontend Dependencies
echo [4/5] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo   ❌ Frontend npm install failed
        pause
        exit /b 1
    )
) else (
    echo   ✓ Frontend dependencies already installed
)

REM Create .env files if they don't exist
echo [5/5] Setting up environment files...
cd /d "%~dp0backend"
if not exist .env (
    copy .env.example .env >nul 2>&1
    echo   ✓ Created backend .env file
)
cd /d "%~dp0frontend"
if not exist .env (
    copy .env.example .env >nul 2>&1
    echo   ✓ Created frontend .env file
)

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║              Setup Complete! 🎉                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Next steps:
echo  ───────────────────────────────────────────────────
echo  1. Start MongoDB (or use Docker)
echo  2. Run: make dev
echo     OR
echo  3. Open two terminals:
echo     - Terminal 1: cd backend ^&^& npm run dev
echo     - Terminal 2: cd frontend ^&^& npm start
echo.
echo  URLs:
echo  ───────────────────────────────────────────────────
echo  • Frontend: http://localhost:3000
echo  • Backend:  http://localhost:5000
echo  • Health:   http://localhost:5000/health
echo.
pause