#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-http://localhost:3005}"
SCENARIO="${SCENARIO:-}"
REPETITIONS="${REPETITIONS:-1}"

usage() {
  echo "Usage: $0 [--scenario <scenario>] [--repetitions <n>] [--host <url>]"
  echo ""
  echo "Options:"
  echo "  --scenario     Scenario to simulate (e.g. single.event, single.auditEvent, single.socEvent)"
  echo "                 Omit to run all scenarios"
  echo "  --repetitions  Number of times to repeat (default: 1)"
  echo "  --host         Base URL of the service (default: http://localhost:3005)"
  echo ""
  echo "Examples:"
  echo "  $0"
  echo "  $0 --scenario single.event"
  echo "  $0 --scenario single.auditEvent --repetitions 10"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scenario)
      SCENARIO="$2"
      shift 2
      ;;
    --repetitions)
      REPETITIONS="$2"
      shift 2
      ;;
    --host)
      HOST="$2"
      shift 2
      ;;
    --help|-h)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

QUERY="repetitions=${REPETITIONS}"
if [[ -n "$SCENARIO" ]]; then
  QUERY="${QUERY}&scenario=${SCENARIO}"
fi

URL="${HOST}/api/v1/simulate/audit?${QUERY}"

echo "POST ${URL}"

curl --silent --show-error --fail-with-body \
  --request POST \
  --header "Content-Type: application/json" \
  --url "$URL" | cat
