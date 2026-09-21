#!/usr/bin/env node
// init-governance.mjs — 一键在目标项目生成五文件治理内核 + 校验器
// 用法：node init-governance.mjs <项目目录> [--no-git]

import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TPL = join(SKILL, 'templates', 'governed');

function parseArgs(argv) {
  const a = { path: null, noGit: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--no-git') a.noGit = true;
    else if (!x.startsWith('--') && !a.path) a.path = x;
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
if (!args.path) {
  console.error('用法：node init-governance.mjs <项目目录> [--no-git]');
  process.exit(1);
}
const root = resolve(args.path);

if (!existsSync(TPL)) { console.error('缺少 templates/ 目录: ' + TPL); process.exit(1); }

mkdirSync(root, { recursive: true });

// 五文件
copyFileSync(join(TPL, 'PROJECT.template.json'), join(root, 'PROJECT.json'));
for (const f of ['GOVERNANCE', 'ROADMAP', 'DECISIONS', 'WORKLOG']) {
  copyFileSync(join(TPL, f + '.template.md'), join(root, f + '.md'));
}
// 按需模板
mkdirSync(join(root, 'docs', 'templates'), { recursive: true });
copyFileSync(join(TPL, 'gate-review.template.md'), join(root, 'docs', 'templates', 'gate-review.template.md'));
copyFileSync(join(TPL, 'iwp.template.md'), join(root, 'docs', 'templates', 'iwp.template.md'));
// GitHub 治理
mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
copyFileSync(join(TPL, '.github', 'CODEOWNERS'), join(root, '.github', 'CODEOWNERS'));
copyFileSync(join(TPL, '.github', 'pull_request_template.md'), join(root, '.github', 'pull_request_template.md'));
copyFileSync(join(TPL, '.github', 'workflows', 'governance.yml'), join(root, '.github', 'workflows', 'governance.yml'));
// 校验器
mkdirSync(join(root, 'scripts'), { recursive: true });
copyFileSync(join(SKILL, 'scripts', 'validate-governance.mjs'), join(root, 'scripts', 'validate-governance.mjs'));

if (!args.noGit) {
  try {
    execSync('git init', { cwd: root, stdio: 'pipe' });
    execSync('git add -A', { cwd: root, stdio: 'pipe' });
    execSync('git commit -m "chore: init enterprise-governance 5-file kernel"', { cwd: root, stdio: 'pipe' });
  } catch (e) { console.warn('[init-governance] git 初始化失败（可稍后手动）: ' + (e.message || e)); }
}

console.log('✅ 已生成治理内核：' + root);
console.log('下一步：');
console.log('  1. 填 PROJECT.json（id / name / human_authorizer / roles.architecture 里的 CHANGE-ME）');
console.log('  2. 判治理等级 L0-L3，按需补 environments/components/risks/exceptions');
console.log('  3. 填 ROADMAP.md / DECISIONS.md / GOVERNANCE.md');
console.log('  4. 完成前跑：node scripts/validate-governance.mjs');
