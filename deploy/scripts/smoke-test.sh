#!/usr/bin/env bash
# Smoke tests for AgentMD dashboard
# Usage: DEPLOY_URL=https://agentmd.io ./deploy/scripts/smoke-test.sh

set -e

URL="${DEPLOY_URL:-}"
if [ -z "$URL" ]; then
  echo "Error: DEPLOY_URL is required (e.g. https://agentmd.io)"
  exit 1
fi

URL="${URL%/}"

echo "Smoke testing $URL ..."

# Health
echo "  GET /api/health"
curl -fsS -o /dev/null -w "    %{http_code}\n" "$URL/api/health"

# Ready (may 503 if DB not configured - that's ok for soft launch)
echo "  GET /api/health/ready"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health/ready" || true)
if [ "$STATUS" = "200" ]; then
  echo "    $STATUS"
else
  echo "    $STATUS (optional: DB/persistence may not be configured)"
fi

# Badge
echo "  GET /api/badge/score?score=87"
curl -fsS -o /dev/null -w "    %{http_code}\n" "$URL/api/badge/score?score=87"

# Demo parse (POST)
echo "  POST /api/demo/parse"
PARSE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL/api/demo/parse" \
  -H "Content-Type: application/json" \
  -d '{"content":"## Test\n`echo ok`","sourceType":"agentsmd"}')
echo "    $PARSE_STATUS"

# Billing status (should always 200)
echo "  GET /api/billing/status"
curl -fsS -o /dev/null -w "    %{http_code}\n" "$URL/api/billing/status"

# Landing page
echo "  GET /"
curl -fsS -o /dev/null -w "    %{http_code}\n" "$URL/"

# Docs
echo "  GET /docs"
curl -fsS -o /dev/null -w "    %{http_code}\n" "$URL/docs"

echo "Smoke tests complete."
