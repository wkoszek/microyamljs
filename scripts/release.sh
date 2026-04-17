#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .version ]; then
    echo "Error: .version not found" >&2
    exit 1
fi

current=$(cat .version)
major=$(echo "$current" | cut -d. -f1)
minor=$(echo "$current" | cut -d. -f2)
patch=$(echo "$current" | cut -d. -f3)

patch_v="$major.$minor.$((patch+1))"
minor_v="$major.$((minor+1)).0"
major_v="$((major+1)).0.0"

echo "Current version: $current"
echo ""
echo "  [1] patch  → $patch_v"
echo "  [2] minor  → $minor_v"
echo "  [3] major  → $major_v"
echo "  [4] custom"
echo ""
read -r -p "Choice [1]: " choice

case "${choice:-1}" in
    1) new=$patch_v ;;
    2) new=$minor_v ;;
    3) new=$major_v ;;
    4)
        read -r -p "Version: " new
        if [[ ! "$new" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
            echo "Error: must be semver (e.g. 1.2.3 or 1.2.3-beta.1)" >&2
            exit 1
        fi
        ;;
    "")
        echo "Cancelled."
        exit 0
        ;;
    *)
        echo "Cancelled."
        exit 0
        ;;
esac

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo ""
    echo "Error: uncommitted changes — commit or stash first" >&2
    exit 1
fi

if git rev-parse "v$new" >/dev/null 2>&1; then
    echo "Error: tag v$new already exists" >&2
    exit 1
fi

echo ""
echo "Releasing $new ..."
echo "$new" > .version
npm pkg set version="$new"

git add .version package.json
git commit -m "chore: release v$new"
git tag -a "v$new" -m "v$new"

echo ""
echo "✓  v$new committed and tagged locally."
echo ""
echo "   Push to GitHub:  git push --follow-tags"
echo "   Publish to npm:  make publish"
