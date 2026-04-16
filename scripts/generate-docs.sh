#!/bin/bash
set -e
cd "$(dirname "$0")/.."

docker run --rm -v "$PWD:/docs" -u "$(id -u):$(id -g)" squidfunk/mkdocs-material build

echo "Docs built to build/site/"