# AGENTS.md（轻档 · 紧凑循环）

默认走紧凑循环，不铺文档、不建治理、不分解多 agent：

```
澄清当下功能 → 最小切片实现 → UI/功能验证 → git 快照
```

## 结构
- 需求 / 进度 / 决策记在 `docs/`（requirements.md、development-log.md、decisions.md）。
- git 是日常回滚；zip 备份只在里程碑或风险操作前做。

## 原则
1. 先问清**当下这一个功能**，再做最小的可运行切片。
2. 有 UI 就先定样子（草图 / 参照物）再写代码。
3. 依赖装在项目内（Python `.venv/`、JS `node_modules/`）。
4. API 密钥走运行时配置 / Settings，不进源码、不进 git。
5. 新功能单独放目录 / 模块，别散落。
6. 实现前想一下"以后会不会要多类别/多平台/多供应商"，会就先别硬编码第一个用例。

## 何时升级到中/重档
出现多人协作 / 要上生产 / 真实数据 / 合规审计要求时，按 `ai-delivery-lifecycle` 的 `references/lifecycle.md` 重新打分选档。
