@echo off
echo Building and deploying ThreatLightHouse to Vercel...

REM Build the React app
call npm run build

REM Deploy to Vercel
call npx vercel --prod

echo Deployment completed!
pause
