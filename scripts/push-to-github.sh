#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-fsd-test-case-generator}"
VISIBILITY="${2:-public}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is not set."
  echo "Create a token at https://github.com/settings/tokens with 'repo' scope."
  echo "Then run: export GITHUB_TOKEN=your_token"
  exit 1
fi

export GH_TOKEN="$GITHUB_TOKEN"

cd "$(dirname "$0")/.."

if git remote get-url origin &>/dev/null; then
  echo "Remote 'origin' already exists."
else
  echo "Creating GitHub repository: $REPO_NAME ($VISIBILITY)"
  gh repo create "$REPO_NAME" \
    --"$VISIBILITY" \
    --source=. \
    --remote=origin \
    --description "Upload FSD and generate comprehensive QA test cases with Cursor Agent"
fi

echo "Pushing to origin/main..."
git push -u origin main

echo "Done! Repository: https://github.com/$(gh api user -q .login)/$REPO_NAME"
