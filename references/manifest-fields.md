# PROJECT.json 字段参考（schema v1）

> PROJECT.json 是唯一机器事实入口。只存当前有效状态与引用，不承载长篇设计。

## 顶层键
| 键 | 必需 | 说明 |
|---|---|---|
| `schema_version` | 是 | 固定 `1` |
| `project` | 是 | 项目身份与治理等级 |
| `state` | 是 | 当前阶段门 + 活动/下一工作项 |
| `authority` | 是 | 权威文件路径 + 人类授权人 |
| `roles` | 是 | 架构/实施/验证/人类 四方 |
| `enforcement` | 是 | 分权开关 |
| `effective` | 是 | 当前有效决策/工作包/制品 |
| `gates` | 是 | 阶段门 G0–G4 状态 |
| `superseded` | 是 | 被替代对象 |
| `environments` / `components` | L2 | 环境/组件注册（L2 起必需） |
| `risks` / `exceptions` | L3 | 风险/例外台账（L3 起必需） |
| `data_authorities` / `contracts` / `ai_platforms` / `findings` | 否 | 按触发矩阵追加 |
| `evidence_anchors` | 否 | 证据锚（可选）：把关键声称钉到 文件:行 + sha256，改动即报漂移 |

## project
```json
{ "id": "acme-portal", "name": "Acme Portal", "governance_level": "L0", "lifecycle": "poc" }
```
- `id`：`^[a-z0-9-]+$`
- `governance_level`：`L0|L1|L2|L3`
- `lifecycle`：`discovery|feasibility|poc|pilot|production|retired`

## state
```json
{ "current_gate": "G0", "active_work_items": [], "next_work_item": null }
```
- `current_gate`：`G0|G1|G2|G3|G4`
- `active_work_items`：`W-xxx` 数组，与 ROADMAP 的 ACTIVE 双向一致（校验器强制）

## authority
```json
{
  "governance": "GOVERNANCE.md", "roadmap": "ROADMAP.md",
  "decisions": "DECISIONS.md", "worklog": "WORKLOG.md",
  "human_authorizer": "<真实人类>"
}
```

## roles
```json
{ "architecture": "架构AI", "delivery": ["AIP-ALICE"], "verifier": "AIP-BOB" }
```
- 值是字符串（人或平台名）；`verifier` 可为 `null`。

## enforcement
```json
{ "file_ownership": true }
```
- `true`（默认）：分权硬约束（本地查重叠 + CI 查 diff 归属）；`false` 关闭。

## effective
```json
{
  "decisions": [ { "id": "D-001", "status": "accepted", "supersedes": [] } ],
  "work_packages": [ {
      "id": "IWP-001", "roadmap_id": "W-001", "status": "APPROVED",
      "approval": "PR-12", "primary": "AIP-ALICE", "verifier": "AIP-BOB",
      "contributors": [], "integrator": null,
      "file_ownership": [ { "owner": "AIP-ALICE", "paths": ["src/app/"] } ]
  } ],
  "artifacts": [ { "id": "ART-001", "version": "1.0.0", "approval": "PR-15" } ]
}
```
- `decisions[].status`：`accepted|provisional`
- `work_packages[].status`：`DRAFT|READY|ACCEPTED|IN_PROGRESS|REVIEW_REQUESTED|CHANGES_REQUIRED|APPROVED|BLOCKED|CANCELLED|CLOSED`
- **批准链**：`APPROVED|CLOSED` 必须有非空 `approval`；`gates` 的 `passed` 必须有非空 `approval`。

## gates
```json
[ { "id": "G0", "status": "planned", "approval": null } ]
```
- `status`：`planned|in_progress|passed|conditional|blocked|failed`

## superseded
```json
[ { "id": "D-000", "path": "docs/old.md", "superseded_by": "D-001" } ]
```

## 扩展对象（L2/L3，按触发追加）
```json
{
  "environments": [ { "id": "ENV-STAGING", "purpose": "...", "status": "active", "data_class": "nonproduction" } ],
  "components": [ { "id": "WAZUH", "role": "检测", "status": "candidate" } ],
  "risks": [ { "id": "R-001", "description": "...", "owner": "...", "expires": "2026-12-31" } ],
  "exceptions": [ { "id": "E-001", "description": "...", "owner": "...", "expires": "2026-12-31" } ]
}
```

## evidence_anchors（证据锚漂移检测）
把「已完成/已验证」的关键声称钉到具体代码行，防止证据失效后无人知晓。

```json
[ { "id": "ANCHOR-001", "path": "src/api/server.mjs", "line": 42, "sha256": "<64位hex>", "claim": "POST /assets 返回 201" } ]
```

- 计算 sha256：`node scripts/validate-governance.mjs --make-anchor src/api/server.mjs:42`
- 校验器每次跑（本地门 + CI 门）都会核对；该行内容一变，就报「证据锚漂移」，强制重新验证。
- `id` 格式：`^ANCHOR-\d{3}$`；`line` 从 1 起；`sha256` 为该行原文（不含换行）的 sha256。

## 更新规则
- 只有阶段门、已批准决策或完成的发布流程可改权威状态。
- Manifest 变更必须与被引用产物**同一变更**提交。
- 不引用不存在、未批准或已废弃的对象。
- AI 不得把自己的交付直接写成 `approved`；批准来自评审或人工授权。
