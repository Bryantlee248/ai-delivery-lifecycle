# ai-delivery-lifecycle（统一分级交付生命周期 skill）

> 把「一个想法」变成「一个合格产品」的**可伸缩、可审计、可反复适用**的统一工具。
> 整合三个 skill 的优点：轻档（个人紧凑循环）、中档（spec 驱动执行面）、重档（企业治理控制面）。

## 核心
- **选档**：5 维 × 0–3 打分（数据/环境/失败影响/协作/合规）→ 机械定轻/中/重，不靠感觉。
- **9 阶段**：立项→治理→规格→架构→计划→实现→收敛→验收→部署/演进；每阶段按档位做多深。
- **可审计**：唯一事实入口（PROJECT.json）+ 批准链 + 证据锚（文件:行+sha256 漂移检测）+ 机器门。

## 安装
```bash
./install.sh pi        # 装到 pi
./install.sh claude    # 装到 Claude Code
./install.sh codex     # 装到 Codex
./install.sh trae      # 装到 Trae
./install.sh omp       # 装到 OMP（Oh My Pi，需 Bun 运行时）
./install.sh all       # 全装
```

## 使用
```bash
# 1. 脚手架（在 skill 目录运行）
node scripts/create_project.mjs <项目> --tier light|standard|governed
# 目标目录必须为空；确认要覆盖已有内容时显式加 --force

# 2. 选档后按 SKILL.md / references/lifecycle.md 推进 9 阶段

# 3. 完成前验证（在项目目录运行；中/重档自带 tools/，重档额外有 scripts/）
node tools/converge.mjs && node tools/verify.mjs          # 中/重档（执行面 gate）
node scripts/validate-governance.mjs [--ci]                # 重档额外（控制面校验器）
```

标准/治理模板中的 `test`、`build`、`lint` 和 E2E 默认会失败，必须替换成项目真实命令后才能通过质量门；`DESIGN.md` 由项目内置的 `tools/design-lint.mjs` 做离线结构检查，不会在收敛时动态下载 npm 包。

## 组成
| 路径 | 内容 |
|---|---|
| `SKILL.md` | 入口：选档 + 9 阶段 + 铁律 |
| `references/lifecycle.md` | 9 阶段 × 3 档矩阵（公共底座） |
| `references/domain-experts.md` | 领域专家按需加载（正交于治理角色） |
| `templates/light|standard|governed` | 三档模板 |
| `scripts/` | create_project + converge/verify + init/validate-governance |

## 前提
- 目标环境需有 **node**（脚本零依赖）；CI 模板为 GitHub Actions。
- OMP（Oh My Pi）平台需 **Bun** 运行时（install.sh 只装 skill，不代装 Bun）。
- 重档沿用 `enterprise-governance` 的已验证机制（含证据锚 v1.1）。

## 版本
v0.1.5（领域专家按需加载引用层）

## 发版规范（四处版本号必须同步）

每次发版，以下**四处**版本号必须一起改，禁止只改其中一部分：

| # | 位置 | 内容 |
|---|---|---|
| 1 | `SKILL.md` 末尾 | `_版本 vX.Y.Z_` |
| 2 | `package.json` | `"version": "X.Y.Z"` |
| 3 | `README.md` 的「版本」节 | `vX.Y.Z（本次改动摘要）` |
| 4 | `git tag` | `vX.Y.Z`（指向合并后的 main） |

发布流程：改代码 → 开 PR（main 受保护，不可直推）→ 合并 → 打 annotated tag → 各平台 `git pull` + `./install.sh` 同步。
