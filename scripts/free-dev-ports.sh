#!/bin/sh
set -eu

if ! command -v lsof >/dev/null 2>&1; then
  echo "lsof is required to release One Browser Web development ports." >&2
  exit 1
fi

for port in "$@"; do
  case "$port" in
    ''|*[!0-9]*)
      echo "Invalid development port: $port" >&2
      exit 1
      ;;
  esac

  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -z "$pids" ]; then
    continue
  fi

  echo "Releasing One Browser Web development port $port"
  kill -TERM $pids 2>/dev/null || true

  attempts=0
  while [ "$attempts" -lt 25 ] && lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    sleep 0.2
    attempts=$((attempts + 1))
  done

  remaining="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$remaining" ]; then
    echo "Port $port did not stop after TERM; forcing the remaining listener." >&2
    kill -KILL $remaining 2>/dev/null || true
  fi

  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Failed to release One Browser Web development port $port." >&2
    exit 1
  fi
done
