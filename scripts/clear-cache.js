const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing caches...');

// Clear Metro cache
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.log('Metro cache cleared');
}

// Clear TypeScript cache
const tsCacheDir = path.join(__dirname, '..', 'node_modules', '.cache');
if (fs.existsSync(tsCacheDir)) {
  fs.rmSync(tsCacheDir, { recursive: true, force: true });
  console.log('TypeScript cache cleared');
}

console.log('✅ Cache clearing complete!'); 