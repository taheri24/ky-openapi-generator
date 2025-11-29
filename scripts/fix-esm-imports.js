#!/usr/bin/env node
/**
 * Post-processing script to add .js extensions to ES module imports
 * Required for "type": "module" in package.json
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');

  // Add .js extensions to relative imports
  content = content.replace(
    /from ['"](\.[^'"]+)(?<!\.js)['"];/g,
    "from '$1.js';"
  );

  content = content.replace(
    /import\s+(['"])\1(\.[^'"]+)(?<!\.js)\1;/g,
    "import '$2.js';"
  );

  writeFileSync(filePath, content, 'utf-8');
}

function processDirectory(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      try {
        processFile(filePath);
        console.log(`✓ Fixed ESM imports in ${filePath}`);
      } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
      }
    }
  }
}

try {
  processDirectory(distDir);
  console.log('✓ ESM import fixes applied successfully');
} catch (error) {
  console.error('✗ Error fixing ESM imports:', error.message);
  process.exit(1);
}
