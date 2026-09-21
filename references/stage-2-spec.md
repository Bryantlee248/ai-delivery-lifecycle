# 阶段 2 · 规格（what/why + UI + NFR）

> 把需求基线定格成可测验收 + UI 规格 + 非功能需求。执行细节沿用中档 `ai-requirement-to-ship` 的 spec 流程，本节补 NFR。

## 三档做法

| 档 | 做法 | 产出 |
|---|---|---|
| 轻 | 需求几行 + UI 大致样子（口头/草图） | README |
| 中 | spec.md（3–5 用户旅程 + 可测验收）+ DESIGN.md（UI 参照物） | spec.md, DESIGN.md |
| 重 | 中档 + NFR + Edge Cases + OpenAPI 契约 | spec + DESIGN + nfr.md + 契约 |

## NFR 分类（IEEE 29148 结构）

模板见 `templates/standard/specs/nfr.md`，五类：
1. **性能**：响应时间（P95）、吞吐；
2. **安全**：认证/授权、传输与存储加密、密钥管理；
3. **可用性**：可用率（SLA）、RPO/RTO；
4. **容量**：用户数、数据量、峰值并发；
5. **合规**：适用法规/标准、审计留痕。

中档填必填项；重档**全填并量化**（"快"不算，"P95 ≤ 200ms"才算）。

## UI 设计工具映射（三层 × 三档）

工具是「规格的来源」，**DESIGN.md 是「验收的锚」**——工具可换，契约不省。

| 档 | 设计源 | 设计系统/组件库 | 规格契约 |
|---|---|---|---|
| 轻 | 无 | 直接挂成熟组件库（Ant Design / shadcn/ui） | 无（草图） |
| 中 | 可选 Figma | shadcn/ui 或 Ant Design | DESIGN.md |
| 重 | Figma（MCP 读设计稿） | 指定设计系统 + tokens 对齐 | DESIGN.md + 设计评审 |

- **设计源**：Figma（`Figma-Context-MCP`、`TalkToFigma`）、`Screenshot-to-code`、`Stitch MCP`。
- **设计系统**：国际 shadcn/ui / MUI / Radix；国内 Ant Design / semi-design（字节）/ naive-ui。
- **规格契约**：DESIGN.md（`google-labs-code/design.md`，Google Labs 标准）；参考库 `awesome-design-md`。
- **铁律**：Figma/组件库提供视觉与 tokens，最终必须落成 DESIGN.md（具体参照物 + 完整 tokens/prose/Do-Don'ts），owner 在「定样子」闸签字。

## 铁律（沿用执行面）
- 验收只写"可观察、用户视角、可测"，不写形容词/技术词；
- UI 必须有规格（DESIGN.md），否则产出"裸丑"；
- 先改清单再改代码（spec 是锚）。
