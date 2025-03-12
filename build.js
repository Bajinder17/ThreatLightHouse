const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure Python bridge scripts are available in the build
const apiDir = path.join(__dirname, 'api');
const buildApiDir = path.join(__dirname, 'build', 'api');

// Create necessary directory structure
console.log('Creating API directory structure in build...');
if (!fs.existsSync(buildApiDir)) {
  fs.mkdirSync(buildApiDir, { recursive: true });
}

// Required subdirectories
const directories = ['scanner', 'database', 'report_generator'];
directories.forEach(dir => {
  const sourcePath = path.join(apiDir, dir);
  const targetPath = path.join(buildApiDir, dir);
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  // Copy Python files
  if (fs.existsSync(sourcePath)) {
    const files = fs.readdirSync(sourcePath);
    files.forEach(file => {
      if (file.endsWith('.py')) {
        fs.copyFileSync(
          path.join(sourcePath, file),
          path.join(targetPath, file)
        );
      }
    });
  }
});

// Copy __init__.py files
console.log('Copying Python package files...');
const initFiles = [
  ['api', '__init__.py'], 
  ['api/scanner', '__init__.py'],
  ['api/database', '__init__.py'],
  ['api/report_generator', '__init__.py']
];

initFiles.forEach(([dir, file]) => {
  const sourcePath = path.join(__dirname, dir, file);
  const targetPath = path.join(__dirname, 'build', dir, file);
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
});

console.log('Build process completed successfully!');
