const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_DIR = path.resolve(__dirname, '../txt');
const GROUP_SIZE = 20;

function scanMdFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.vuepress') continue;
      scanMdFiles(fullPath, results);
    } else if (entry.name.endsWith('.md')) {
      const rel = path.relative(DOCS_DIR, fullPath).replace(/\\/g, '/');
      results.push(rel);
    }
  }
  return results;
}

function cleanGeneratedGroups() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = fs.readdirSync(OUTPUT_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && /^group-\d+$/.test(entry.name)) {
      fs.rmSync(path.join(OUTPUT_DIR, entry.name), { recursive: true, force: true });
    }
  }
}

function toTxtRelativePath(rel) {
  return rel.replace(/\//g, '__').replace(/\.md$/, '.txt');
}

function generate() {
  const files = scanMdFiles(DOCS_DIR).sort((a, b) =>
    a.localeCompare(b, 'zh-CN', { numeric: true })
  );

  cleanGeneratedGroups();

  files.forEach((rel, index) => {
    const groupIndex = Math.floor(index / GROUP_SIZE) + 1;
    const groupName = `group-${String(groupIndex).padStart(3, '0')}`;
    const sourceFile = path.join(DOCS_DIR, rel);
    const outputFile = path.join(OUTPUT_DIR, groupName, toTxtRelativePath(rel));

    fs.mkdirSync(path.join(OUTPUT_DIR, groupName), { recursive: true });
    fs.copyFileSync(sourceFile, outputFile);
  });

  const groupCount = Math.ceil(files.length / GROUP_SIZE);
  console.log(
    `Generated ${files.length} txt files in ${groupCount} groups to ${OUTPUT_DIR}`
  );
}

generate();
