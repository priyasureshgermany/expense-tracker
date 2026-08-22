#!/bin/sh
# Git hooks live outside the repo, so they have to be installed per clone.
set -e
hook="$(git rev-parse --git-path hooks)/pre-commit"
cp "$(dirname "$0")/pre-commit" "$hook"
chmod +x "$hook"
echo "installed $hook"
