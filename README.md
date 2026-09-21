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
./install.sh all       # 全装
```

## 使用
```bash
# 1. 脚手架（按档位）
node scripts/create_project.mjs <项目> --tier light|standard|governed
# 2. 选档后按 SKILL.md / references/lifecycle.md 推进 9 阶段
# 3. 完成前验证（按档位）
node tools/converge.mjs && node tools/verify.mjs          # 中/重档
node scripts/validate-governance.mjs [--ci]                # 重档额外
```

## 组成
| 路径 | 内容 |
|---|---|
| `SKILL.md` | 入口：选档 + 9 阶段 + 铁律 |
| `references/lifecycle.md` | 9 阶段 × 3 档矩阵（公共底座） |
| `templates/light|standard|governed` | 三档模板 |
| `scripts/` | create_project + converge/verify + init/validate-governance |

## 前提
- 目标环境需有 **node**（脚本零依赖）；CI 模板为 GitHub Actions。
- 重档沿用 `enterprise-governance` 的已验证机制（含证据锚 v1.1）。

## 版本
v0.1（骨架落地）
