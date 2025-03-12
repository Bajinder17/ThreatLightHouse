#!/bin/bash
# Simple deployment script for ThreatLightHouse

echo "Building React app..."
npm run build

echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment completed."
