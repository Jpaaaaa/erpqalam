#!/usr/bin/env bash
# Export HRAT user_id → name mapping to CSV.
#
# Usage:
#   ./scripts/export-hrat-users-csv.sh /path/to/attendance.db [output.csv]
#   HRAT_DB_PATH=~/.config/hrat/attendance.db ./scripts/export-hrat-users-csv.sh
#
# Linux (Electron):  ~/.config/hrat/attendance.db
# Windows:           %APPDATA%\\hrat\\attendance.db

set -euo pipefail

DB_PATH="${1:-${HRAT_DB_PATH:-}}"
OUT="${2:-hrat-users.csv}"

if [[ -z "$DB_PATH" ]]; then
  echo "Usage: $0 /path/to/attendance.db [output.csv]" >&2
  echo "Or set HRAT_DB_PATH." >&2
  exit 1
fi

if [[ ! -f "$DB_PATH" ]]; then
  echo "File not found: $DB_PATH" >&2
  exit 1
fi

if ! command -v sqlite3 >/dev/null; then
  echo "sqlite3 CLI is required." >&2
  exit 1
fi

sqlite3 -header -csv "$DB_PATH" \
  "SELECT user_id AS deviceUserId, TRIM(name) AS name FROM users WHERE TRIM(user_id) <> '' ORDER BY CAST(user_id AS INTEGER), user_id;" \
  > "$OUT"

echo "Exported $(($(wc -l < "$OUT") - 1)) users to $OUT"
