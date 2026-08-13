const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_FILE = path.resolve(__dirname, '../dist/link.md');
const BASE_URL = 'https://vkdoc.fsq.pub';

function scanMdFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.vuepress') continue;
      scanMdFiles(fullPath, results);
    } else if (entry.name.endsWith('.md')) {
      // 跳过根目录 README.md
      const rel = path.relative(DOCS_DIR, fullPath).replace(/\\/g, '/');
      if (rel === 'README.md') continue;
      results.push(rel);
    }
  }
  return results;
}

function generate() {
  const files = scanMdFiles(DOCS_DIR);

  // 按顶级目录分组
  const groups = {};
  for (const rel of files) {
    const topDir = rel.split('/')[0];
    if (!groups[topDir]) groups[topDir] = [];
    groups[topDir].push(rel);
  }

  // 各组内排序
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
  }

  // 输出
  const lines = [];
  const sortedKeys = Object.keys(groups).sort();
  for (const key of sortedKeys) {
    lines.push(`## ${key}`);
    lines.push('');
    lines.push('```');
    groups[key].forEach((rel, i) => {
      if (i > 0 && i % 10 === 0) lines.push('');
      const url = rel.replace(/README\.md$/, '');
      lines.push(`${BASE_URL}/${url.endsWith('/') ? url : url.replace(/\.md$/, '.html')}`);
    });
    lines.push('```');
    lines.push('');
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf-8');
  console.log(`Generated ${files.length} links to ${OUTPUT_FILE}`);
}

generate();
