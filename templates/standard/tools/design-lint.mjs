#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const file = 'DESIGN.md';
if (!existsSync(file)) { console.error('缺失 DESIGN.md'); process.exit(1); }
const text = readFileSync(file, 'utf8');
const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!frontmatter) { console.error('DESIGN.md 缺少 YAML frontmatter'); process.exit(1); }
const required = ['version:', 'name:', 'description:', 'colors:', 'typography:'];
const missing = required.filter(key => !new RegExp(`^${key}`, 'm').test(frontmatter[1]));
const placeholders = /<设计名>|<一句话：|\(每个色的含义|\(字号层级/.test(text);
if (missing.length || placeholders) {
  if (missing.length) console.error('缺少字段: ' + missing.join(', '));
  if (placeholders) console.error('仍包含设计占位内容');
  process.exit(1);
}
console.log('DESIGN.md structural lint OK');
