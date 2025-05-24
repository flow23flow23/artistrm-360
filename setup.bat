@echo off
echo.
echo 🚀 ArtistRM 360 - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm 9+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Install functions dependencies
echo 📦 Installing Cloud Functions dependencies...
cd functions
call npm install
cd ..

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Firebase CLI is not installed. Installing...
    call npm install -g firebase-tools
)

echo ✅ Firebase CLI installed
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your Firebase credentials
)

REM Initialize git hooks
echo 🔧 Setting up git hooks...
call npx husky install

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your Firebase credentials
echo 2. Run 'firebase login' to authenticate
echo 3. Run 'firebase use zamx-v1' to select your project
echo 4. Run 'npm run dev:all' to start development
echo.
echo Happy coding! 🎉
echo.
pause