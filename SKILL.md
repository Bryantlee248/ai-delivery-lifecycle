---
name: ai-delivery-lifecycle
description: Unified tiered software delivery lifecycle — turn an idea into a qualified product. Use when starting or running a project. Pick a tier (light/standard/governed) by risk scoring, then follow 9 stages (intake → governance → spec → architecture → planning → implementation → convergence → acceptance → deploy). Light tier = compact loop; standard = spec-driven execution; governed = adds a control plane (manifest, role separation, approval chain, evidence anchors).
---

# AI Delivery Lifecycle

把「一个想法」变成「一个合格产品」的分级生命周期。信条：**档位由风险触发，审计由机器执行，流程是护栏不是产品。**

## 触发
开始新项目、或按此生命周期推进/收尾已有项目时。

## 第一步：选档（打分，不靠感觉）
对 5 维各打 0–3 分（数据 / 环境 / 失败影响 / 协作 / 合规，打分表见 `references/lifecycle.md`）：
```
重档：任一维度 ≥ 2
轻档：五个维度全 = 0
中档：其余
```
- **轻档 = L0**：走紧凑循环，不建治理、不铺文档。
- **中档 = L1**：走完整 9 阶段 + 执行面机器门（converge/verify）。
- **重档 = L2/L3**：中档 + 控制面（五文件 manifest + 分权 + 批准链 + 证据锚）。

## 总流程（9 阶段，每阶段按档位做多深）
完整矩阵见 `references/lifecycle.md`（9 阶段 × 3 档）：
```
立项 → 治理 → 规格 → 架构 → 计划 → 实现 → 收敛 → 验收 → 部署/演进
```

## 三档要点
- **轻档（紧凑循环）**：`澄清当下功能 → 最小切片实现 → UI/功能验证 → git 快照`，循环直到做完。
- **中档（执行面）**：spec（用户旅程+可测验收）→ DESIGN（UI 参照物）→ plan → tasks（垂直切片）→ dev-loop → converge → 验收四关。
- **重档（+控制面）**：五文件 manifest（PROJECT.json 唯一事实入口）→ 角色分权 → CI diff 归属门 → 批准链（APPROVED 挂证据）→ 证据锚（文件:行+sha256 漂移检测）。

## 铁律（任何档位不得违反）
1. **垂直切片**：一条旅程端到端（界面+逻辑+数据+权限+审计），禁止水平切。
2. **先改清单再改代码**：规格/清单是锚，代码随清单走。
3. **机器门不绿 = 没完成**：中档 converge；重档 + validate + CI diff 归属 + 证据锚。
4. **真人关不可替代**：UAT、风险拍板、生产批准必须人签字。
5. **没推 = 没发生**：小步 commit + push。

## 脚手架（按档位）
```bash
node scripts/create_project.mjs <目录> --tier light|standard|governed
```

## 完成前验证（按档位）
```bash
# 中/重档
node tools/converge.mjs && node tools/verify.mjs
# 重档额外
node scripts/validate-governance.mjs            # 本地门（含批准链 + 证据锚漂移）
node scripts/validate-governance.mjs --ci       # CI 门（diff 归属 + 权威文档同变更）
```

## 按需加载（省 token）
- 选档 + 阶段地图：`references/lifecycle.md`
- 立项方法链（JTBD/Kano/QFD/Gherkin）：`references/stage-0-intake.md`（重档必读）
- 重档治理机制（按需读，四个）：
  - `references/governance-model.md` — 三平面 + 阶段门 G0-G4 + 评审 P0-P3
  - `references/role-protocol.md` — 角色分权与文件所有权
  - `references/level-triggers.md` — L0-L3 触发矩阵 + 治理对象清单
  - `references/manifest-fields.md` — PROJECT.json 字段参考
- UI 设计（重档涉及 Figma/组件库时）：见 `references/stage-2-spec.md` 的设计工具映射；Figma 接入读 `figma/mcp-server-guide`。
- 项目类型专属（B/S·C/S·小程序·App·CLI 的技术栈/UI/验收/分发）：`references/project-types.md`。
- 会话切换：重档读 `PROJECT.json + GOVERNANCE.md + WORKLOG.md 尾部 + git log`；轻/中档读 `AGENTS.md + git log`。

---

_版本 v0.1_
