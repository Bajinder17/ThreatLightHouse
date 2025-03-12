console.log('Build process starting...');

// Remove unnecessary server.js file which could create an additional serverless function
const fs = require('fs');
const path = require('path');

// List of files to check and delete if they exist
const filesToRemove = [
  path.join(__dirname, 'api', 'scan-url.js'),
  path.join(__dirname, 'api', 'scan-ports.js'), 
  path.join(__dirname, 'api', 'scan-file.js'),
  path.join(__dirname, 'api', 'reports.js')
];

// Remove each file if it exists
filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed: ${file}`);
    }
  } catch (err) {
    console.error(`Error removing file ${file}:`, err);
  }
});

console.log('Build process completed successfully!');
