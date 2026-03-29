#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Quick redeploy — run after pushing code updates
# Usage: bash /opt/brighternepal/deploy/redeploy.sh [api|chat|frontend|all]
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/brighternepal"
TARGET="${1:-all}"

redeploy_api() {
    echo "→ Redeploying API..."
    cd "$APP_DIR/brighter-nepal-api"
    git pull --ff-only
    source venv/bin/activate
    pip install -r requirements.txt -q
    deactivate
    systemctl restart bn-api
    echo "  ✓ API restarted"
}

redeploy_chat() {
    echo "→ Redeploying Chat..."
    cd "$APP_DIR/brighter-nepal-chat"
    git pull --ff-only
    source venv/bin/activate
    pip install -r requirements.txt -q
    deactivate
    systemctl restart bn-chat
    echo "  ✓ Chat restarted"
}

redeploy_frontend() {
    echo "→ Redeploying Frontend..."
    cd "$APP_DIR/brighter-nepal"
    git pull --ff-only
    npm install
    npm run build
    # Copy static assets into standalone output
    if [ -d ".next/standalone" ]; then
        mkdir -p .next/standalone/.next
        cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
        cp -r public .next/standalone/public 2>/dev/null || true
    fi
    systemctl restart bn-frontend
    echo "  ✓ Frontend restarted"
}

case "$TARGET" in
    api)      redeploy_api ;;
    chat)     redeploy_chat ;;
    frontend) redeploy_frontend ;;
    all)
        redeploy_api
        redeploy_chat
        redeploy_frontend
        ;;
    *)
        echo "Usage: $0 [api|chat|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo "✓ Redeploy complete. Check: systemctl status bn-api bn-chat bn-frontend"
