#!/usr/bin/env bash
set -euo pipefail
# install.sh — 把 ai-delivery-lifecycle 装到目标 AI 平台
# 用法：./install.sh [pi|claude|codex|trae|omp|all]   （默认 pi）

TARGET="${1:-pi}"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="ai-delivery-lifecycle"

install_to() {
  local dest="$1"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  cp -R "$SRC" "$dest"
  echo "✅ 已安装：$dest"
}

case "$TARGET" in
  pi)
    install_to "${PI_SKILLS_DIR:-$HOME/.pi/agent/skills}/$NAME"
    ;;
  claude)
    install_to "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/$NAME"
    ;;
  codex)
    install_to "${CODEX_HOME:-$HOME/.codex}/skills/$NAME"
    ;;
  trae)
    install_to "${TRAE_SKILLS_DIR:-$HOME/.trae/skills}/$NAME"
    ;;
  omp)
    install_to "${OMP_SKILLS_DIR:-$HOME/.omp/agent/skills}/$NAME"
    ;;
  all)
    install_to "$HOME/.pi/agent/skills/$NAME"
    install_to "$HOME/.claude/skills/$NAME"
    install_to "$HOME/.codex/skills/$NAME"
    install_to "$HOME/.trae/skills/$NAME"
    install_to "$HOME/.omp/agent/skills/$NAME"
    ;;
  *)
    echo "未知目标：$TARGET（可选 pi|claude|codex|trae|omp|all）" >&2
    exit 1
    ;;
esac

echo "重启对应平台，让 skill 生效。"
