@echo off
echo Building and deploying ThreatLightHouse to Vercel...

REM Clean any previous builds
if exist "build" (
  echo Cleaning previous build...
  rmdir /S /Q build
)

REM Run prebuild script manually to ensure proper cleanup
echo Running prebuild cleanup...
node prebuild.js

REM Build the React app
call npm run build

REM Deploy to Vercel using direct mode (which deploys the current directory)
echo Deploying to Vercel...
call npx vercel --prod

echo Deployment completed!
pause
