#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP_SRC="${1:-/home/yogita/Downloads/FunML_Sp_26_LectNotes .zip}"
SRC_DIR="$ROOT/source"
RAW_DIR="$SRC_DIR/raw"
ZIP_DEST="$SRC_DIR/FunML_Sp_26_LectNotes.zip"

if [[ ! -f "$ZIP_SRC" ]]; then
  echo "Zip not found: $ZIP_SRC" >&2
  exit 1
fi

mkdir -p "$SRC_DIR"
cp -f "$ZIP_SRC" "$ZIP_DEST"

rm -rf "$RAW_DIR"
mkdir -p "$RAW_DIR"
unzip -q "$ZIP_DEST" -d "$RAW_DIR"

python3 "$ROOT/buildsite.py" --src "$RAW_DIR" --out "$ROOT"
