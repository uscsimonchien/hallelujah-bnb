#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp ./*.html dist/
cp -R assets dist/

find . -maxdepth 1 -type f \( \
  -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o \
  -name '*.gif' -o -name '*.svg' -o -name '*.ico' -o \
  -name 'robots.txt' -o -name 'sitemap.xml' \
\) -exec cp {} dist/ \;

echo "Cloudflare Pages build ready in dist/"
