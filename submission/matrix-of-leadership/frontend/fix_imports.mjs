import fs from 'fs';
import path from 'path';

// This script fixes the broken import placement from the previous refactor_api.mjs.
// The old script inserted `import { API_URL, WS_URL }` inside multi-line import blocks.
// This script:
// 1. Removes all incorrectly placed `import { API_URL, WS_URL } from "@/lib/api";` lines
// 2. Re-inserts a single correct import line after the last import statement

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip api.ts itself
  if (filePath.endsWith('api.ts')) return;
  
  // Check if file uses API_URL or WS_URL
  const usesApi = content.includes('${API_URL}') || content.includes('${WS_URL}');
  if (!usesApi) return;
  
  console.log(`Fixing: ${filePath}`);
  
  // Remove ALL existing import lines for API_URL/WS_URL
  const lines = content.split('\n');
  const cleaned = lines.filter(line => !line.trim().startsWith('import { API_URL, WS_URL } from'));
  content = cleaned.join('\n');
  
  // Find the correct insertion point: after all imports are done
  // We look for the last line that starts with "import " or is "} from " (end of multi-line import)
  const newLines = content.split('\n');
  let lastImportEnd = -1;
  let inMultiLineImport = false;
  
  for (let i = 0; i < newLines.length; i++) {
    const trimmed = newLines[i].trim();
    
    if (trimmed.startsWith('import ') && trimmed.includes(' from ')) {
      // Single-line import
      lastImportEnd = i;
    } else if (trimmed.startsWith('import ') && !trimmed.includes(' from ')) {
      // Start of multi-line import
      inMultiLineImport = true;
    } else if (inMultiLineImport && trimmed.includes('} from ')) {
      // End of multi-line import
      inMultiLineImport = false;
      lastImportEnd = i;
    }
  }
  
  if (lastImportEnd === -1) {
    // No imports found, insert at the top after "use client"
    const useClientIdx = newLines.findIndex(l => l.trim().includes('"use client"'));
    lastImportEnd = useClientIdx >= 0 ? useClientIdx : 0;
  }
  
  // Insert import after the last import
  newLines.splice(lastImportEnd + 1, 0, 'import { API_URL, WS_URL } from "@/lib/api";');
  
  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log(`  -> Fixed. Import inserted after line ${lastImportEnd + 1}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'src'));
console.log('\\nAll files fixed.');
