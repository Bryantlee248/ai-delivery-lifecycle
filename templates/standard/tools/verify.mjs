#!/usr/bin/env node
// verify.mjs — 独立验证器骨架（只看"产物"，不看任何 agent 自述）
// 目标：堵住"agent 自我美化"——完成与否由本脚本的 JSON 判定，而非 agent 的完成语。
// 依据：oh-my-agent「checks the artifacts」；LLM-as-judge 的 self-preference 偏差。
//
// 运行：node tools/verify.mjs
// 输出：verify-report.json + 控制台 JSON；未全过 exit 1。

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const checks = [];
function add(id, desc, fn) {
  let ok = false, detail = '';
  try { const r = fn(); ok = !!r.ok; detail = r.detail || ''; }
  catch (e) { ok = false; detail = String(e.message || e); }
  checks.push({ id, desc, ok, detail });
}

// 1) 规格存在（产物）
add('SPEC_EXISTS', 'specs/spec.md 存在且含旅程', () => {
  const p = 'specs/spec.md';
  if (!existsSync(p)) return { ok: false, detail: 'missing ' + p };
  const t = readFileSync(p, 'utf8');
  const n = (t.match(/^\s*-\s*id:\s*\S+/gm) || []).length;
  return { ok: n > 0, detail: 'journeys=' + n };
});

// 2) DESIGN 存在（有 UI 就必须）
add('DESIGN_EXISTS', 'DESIGN.md 存在（有 UI 项目必须）', () => {
  return { ok: existsSync('DESIGN.md'), detail: existsSync('DESIGN.md') ? 'present' : 'missing (UI 项目视为失败)' };
});

// 3) 旅程 e2e 脚本存在（跳过注释行）
add('E2E_SCRIPTS_EXIST', 'e2e 验收脚本存在', () => {
  if (!existsSync('specs/spec.md')) return { ok: false, detail: 'no spec' };
  const lines = readFileSync('specs/spec.md', 'utf8').split(/\r?\n/);
  const cmds = [];
  for (const l of lines) {
    if (/^\s*#/.test(l)) continue;
    const m = l.match(/verify:\s*(?:"([^"]+)"|'([^']+)'|(.+))$/);
    if (m) cmds.push((m[1] || m[2] || m[3]).trim());
  }
  const paths = cmds.map((c) => c.match(/(?:node|bash|sh|pwsh|powershell)(?:\.exe)?\s+(?:-File\s+)?([^\s"]+)/i)?.[1] || c.split(/\s+/)[0]);
  const missing = paths.filter(c => !existsSync(c));
  return { ok: cmds.length > 0 && missing.length === 0, detail: 'scripts=' + cmds.length + ' missing=' + (missing.join(',') || 'none') };
});

// 4) converge 已收敛（读其产物 gaps.md，而非重跑）
add('CONVERGED_ARTIFACT', 'converge 产物显示已收敛', () => {
  const p = 'specs/gaps.md';
  if (!existsSync(p)) return { ok: false, detail: 'no gaps.md (converge 未跑)' };
  const t = readFileSync(p, 'utf8');
  return { ok: /CONVERGED ✅/.test(t) && !/NOT CONVERGED/.test(t), detail: /NOT CONVERGED/.test(t) ? 'NOT CONVERGED' : 'CONVERGED' };
});

// 5) 实际执行项目质量命令，拒绝“只存在配置文件”的假绿
add('PROJECT_QUALITY_COMMANDS', '实际执行 test/build/lint 质量命令', () => {
  if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const scripts = pkg.scripts || {};
    const missing = ['lint', 'test', 'build'].filter(k => typeof scripts[k] !== 'string' || !scripts[k].trim());
    if (missing.length) return { ok: false, detail: 'package.json 缺少 scripts: ' + missing.join(',') };
    for (const name of ['lint', 'test', 'build']) {
      try {
        execSync(`npm run ${name} --if-present`, { cwd: process.cwd(), stdio: 'pipe', timeout: 120000, shell: true });
      } catch (e) {
        const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
        return { ok: false, detail: `${name} 失败: ${out.split(/\r?\n/).filter(Boolean).slice(-2).join(' | ')}` };
      }
    }
    return { ok: true, detail: 'npm lint/test/build 均通过' };
  }
  if (existsSync('pom.xml')) return runCommand('mvn -B test package', 'maven test/package');
  if (existsSync('Makefile')) return runCommand('make lint test build', 'make lint/test/build');
  return { ok: false, detail: '未找到 package.json、pom.xml 或 Makefile' };
});

// 6) 无密钥落库（有 Git 扫描跟踪文件；无 Git 扫描项目文件）
add('NO_SECRETS_COMMITTED', '无密钥明文入库（扫描常见模式）', () => {
  let files = [];
  if (existsSync('.git')) {
    try { files = execSync('git ls-files', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).split(/\r?\n/).filter(Boolean); }
    catch { files = walkFiles(process.cwd()); }
  } else files = walkFiles(process.cwd());
  files = files.filter(f => !/\.md$/i.test(f) && !/example/i.test(f) && !/node_modules/.test(f));
  const patterns = [ /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /password\s*=\s*["'`][^"'`]{6,}/i ];
  const hits = [];
  for (const f of files) {
    let c; try { c = readFileSync(f, 'utf8'); } catch { continue; }
    for (const re of patterns) if (re.test(c)) { hits.push(f + ' :: ' + String(re)); break; }
  }
  return { ok: hits.length === 0, detail: hits.length ? 'possible secrets: ' + hits[0] : 'clean' };
});

function runCommand(command, label) {
  try { execSync(command, { cwd: process.cwd(), stdio: 'pipe', timeout: 120000, shell: true }); return { ok: true, detail: label + ' 通过' }; }
  catch (e) {
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    return { ok: false, detail: label + ' 失败: ' + out.split(/\r?\n/).filter(Boolean).slice(-2).join(' | ') };
  }
}

function walkFiles(dir, prefix = '') {
  const ignored = new Set(['.git', 'node_modules', '.venv', 'dist', 'build', 'target']);
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkFiles(absolute, relative));
    else if (statSync(absolute).size <= 2 * 1024 * 1024) out.push(relative);
  }
  return out;
}

const allOk = checks.every(c => c.ok);
const report = { tool: 'verify', at: new Date().toISOString(), note: 'independent verification: judged by artifacts, not by agent narration', all_pass: allOk, checks };
writeFileSync('verify-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!allOk) process.exit(1);
