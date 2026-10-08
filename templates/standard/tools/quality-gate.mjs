#!/usr/bin/env node
// 默认质量门明确失败；项目接入真实命令后删除或替换 package.json 中的入口。
const kind = process.argv[2] || 'quality';
console.error(`[quality-gate] 未配置真实的 ${kind} 命令，请在 package.json 中替换此脚手架入口。`);
process.exit(1);
