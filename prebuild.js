const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting prebuild cleanup...');

// List of directories to remove
const directoriesToRemove = [
  'api/scanner',
  'api/database',
  'api/report_generator',
];

// List of files to remove
const filesToRemove = [
  'server.js',
  'build.js',
  'api/app.py',
  'Procfile',
  'runtime.txt',
  'requirements.txt',
];

// Function to safely remove a directory
function removeDirectory(dirPath) {
  try {
    const fullPath = path.join(__dirname, dirPath);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing directory: ${dirPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Error removing directory ${dirPath}:`, error);
  }
}

// Function to safely remove a file
function removeFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing file: ${filePath}`);
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
  }
}

// Remove directories
directoriesToRemove.forEach(removeDirectory);

// Remove files
filesToRemove.forEach(removeFile);

console.log('Prebuild cleanup completed!');
