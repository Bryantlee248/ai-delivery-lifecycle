#!/usr/bin/env node
// create_project.mjs — 统一脚手架（按档位生成骨架）
// 用法：node create_project.mjs <项目目录> [--tier light|standard|governed] [--no-git]

import { cpSync, mkdirSync, existsSync, copyFileSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TPL = join(SKILL, 'templates');

function parseArgs(argv) {
  const a = { path: null, tier: 'standard', noGit: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--tier') a.tier = (argv[++i] || 'standard').toLowerCase();
    else if (x === '--no-git') a.noGit = true;
    else if (!x.startsWith('--') && !a.path) a.path = x;
  }
  if (!['light', 'standard', 'governed'].includes(a.tier)) {
    console.error('--tier 只能是 light | standard | governed');
    process.exit(1);
  }
  return a;
}

function copyDir(src, dest) {
  if (!existsSync(src)) { console.error('缺少模板目录: ' + src); process.exit(1); }
  cpSync(src, dest, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.path) {
    console.error('用法：node create_project.mjs <项目目录> [--tier light|standard|governed] [--no-git]');
    process.exit(1);
  }
  const root = resolve(args.path);
  mkdirSync(root, { recursive: true });

  if (args.tier === 'light') {
    copyDir(join(TPL, 'light'), root);
  }

  if (args.tier === 'standard') {
    copyDir(join(TPL, 'standard'), root);
  }

  if (args.tier === 'governed') {
    copyDir(join(TPL, 'standard'), root);   // 执行面
    copyDir(join(TPL, 'governed'), root);   // 控制面
    // 五文件去掉 .template
    for (const [from, to] of [
      ['PROJECT.template.json', 'PROJECT.json'],
      ['GOVERNANCE.template.md', 'GOVERNANCE.md'],
      ['ROADMAP.template.md', 'ROADMAP.md'],
      ['DECISIONS.template.md', 'DECISIONS.md'],
      ['WORKLOG.template.md', 'WORKLOG.md'],
    ]) {
      const src = join(root, from);
      if (existsSync(src)) renameSync(src, join(root, to));
    }
    // 按需模板移到 docs/templates/（保留 .template.md 名）
    mkdirSync(join(root, 'docs', 'templates'), { recursive: true });
    for (const f of ['gate-review.template.md', 'iwp.template.md']) {
      const src = join(root, f);
      if (existsSync(src)) renameSync(src, join(root, 'docs', 'templates', f));
    }
    // 校验器
    mkdirSync(join(root, 'scripts'), { recursive: true });
    copyFileSync(join(SKILL, 'scripts', 'validate-governance.mjs'), join(root, 'scripts', 'validate-governance.mjs'));
  }

  if (!args.noGit) {
    try {
      execSync('git init', { cwd: root, stdio: 'pipe' });
      execSync('git add -A', { cwd: root, stdio: 'pipe' });
      execSync(`git commit -m "chore: init project (ai-delivery-lifecycle, ${args.tier} tier)"`, { cwd: root, stdio: 'pipe' });
    } catch { console.warn('[create_project] git 初始化失败（可稍后手动）'); }
  }

  console.log('✅ 已创建 ' + args.tier + ' 档项目：' + root);
  if (args.tier === 'light') console.log('下一步：填 docs/requirements.md，走紧凑循环（澄清→切片→验证→快照）。');
  if (args.tier === 'standard') console.log('下一步：填 docs/adr/0001、specs/spec.md、DESIGN.md，按 spec→plan→tasks→converge→验收 走。');
  if (args.tier === 'governed') console.log('下一步：填 PROJECT.json 的 CHANGE-ME、定 L0-L3，按 9 阶段走；完成前跑 node scripts/validate-governance.mjs。');
}

main();
