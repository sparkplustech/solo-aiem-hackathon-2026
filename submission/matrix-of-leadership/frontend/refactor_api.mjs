import fs from 'fs';
import path from 'path';

const searchRegex = /("http:\/\/localhost:8000|'http:\/\/localhost:8000|`http:\/\/localhost:8000|"ws:\/\/localhost:8000|'ws:\/\/localhost:8000|`ws:\/\/localhost:8000)/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!searchRegex.test(content)) return;
  
  console.log(`Processing: ${filePath}`);
  
  // Add import if not present
  if (!content.includes('import { API_URL, WS_URL }')) {
    const importStmt = `import { API_URL, WS_URL } from "@/lib/api";\n`;
    // Insert after the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
    } else {
      content = importStmt + content;
    }
  }

  // Replace http
  content = content.replace(/["'`]http:\/\/localhost:8000([^"'`]*)["'`]/g, '`${API_URL}$1`');
  
  // Replace ws
  content = content.replace(/["'`]ws:\/\/localhost:8000([^"'`]*)["'`]/g, '`${WS_URL}$1`');

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'src'));
console.log('Done.');
