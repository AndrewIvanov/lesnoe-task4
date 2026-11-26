#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null; then echo 'Установите Python 3 или используйте Live Server в VS Code.'; exit 1; fi
(sleep 1; open http://localhost:8000) &
python3 -m http.server 8000 --bind 127.0.0.1
