#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"

"${PYTHON_BIN}" -m pip install -e "${ROOT_DIR}/Megatron-LM"
"${PYTHON_BIN}" -m pip install -e "${ROOT_DIR}/mbridge"
"${PYTHON_BIN}" -m pip install -e "${ROOT_DIR}/ms-swift"

"${PYTHON_BIN}" - <<'PY'
import megatron.core
import mbridge
import swift

print('megatron-core', megatron.core.__version__)
print('mbridge', getattr(mbridge, '__version__', 'unknown'))
print('ms-swift', swift.__version__)
PY
