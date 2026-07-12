#!/usr/bin/env bash
#
# One-time, DESTRUCTIVE git history rewrite that strips the multi-megabyte image
# blobs which bloated this repo's history — the pre-compression versions of
# images in src/assets/images and the full-size originals of archive/wedding/img.
#
# It does NOT change the current working tree: HEAD's files are byte-identical
# afterward. It only removes the fat blobs from PAST commits, shrinking a fresh
# clone from ~65 MB down to ~15 MB.
#
# Because it rewrites every commit SHA, the result must be force-pushed to main
# and anyone with an existing clone must re-clone. Run it deliberately.
#
# Prerequisites:
#   - git-filter-repo  (https://github.com/newren/git-filter-repo)
#       pip install git-filter-repo      # or: brew install git-filter-repo
#   - The compression + size-guard changes should already be on main, so the
#     current images are all under the threshold and survive the rewrite.
#
# Usage (run from a FRESH, FULL clone — never a shallow one):
#   scripts/purge-history.sh            # rewrite locally + push a backup tag, then stop
#   scripts/purge-history.sh --push     # rewrite AND force-push the cleaned main
#
set -euo pipefail

# Keeps the ~1000 KB legacy animated gif and every <=700 KB compressed image;
# strips every historical blob >= ~1.15 MB (the old 4 MB / 2.9 MB image versions
# and the pre-compression wedding originals).
THRESHOLD="1100K"
BACKUP_TAG="backup/pre-purge-$(date +%Y-%m-%d)"
DEFAULT_BRANCH="main"

do_push=false
[ "${1:-}" = "--push" ] && do_push=true

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "error: git-filter-repo not found. Install it with:  pip install git-filter-repo" >&2
  exit 1
fi

# Guard against running in a shallow clone, which would corrupt history.
if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  echo "error: this is a shallow clone. Re-clone with full history first." >&2
  exit 1
fi

remote_url="$(git remote get-url origin)"
echo "Repo:      $(git rev-parse --show-toplevel)"
echo "Origin:    $remote_url"
echo "Threshold: strip blobs bigger than $THRESHOLD"
echo

# 1. Safety net: an immutable pointer to the pre-rewrite history on the remote.
echo ">> Pushing backup tag $BACKUP_TAG -> origin"
git tag -f "$BACKUP_TAG" "$DEFAULT_BRANCH"
git push -f origin "refs/tags/$BACKUP_TAG"

# 2. The rewrite. filter-repo intentionally drops 'origin' as a safety measure.
echo ">> Rewriting history (this may take a minute)"
git filter-repo --strip-blobs-bigger-than "$THRESHOLD" --force

# 3. filter-repo removed the remote; put it back.
git remote add origin "$remote_url" 2>/dev/null || git remote set-url origin "$remote_url"

echo
echo ">> Done rewriting. New .git size:"
du -sh .git

if [ "$do_push" = true ]; then
  echo ">> Force-pushing cleaned $DEFAULT_BRANCH to origin"
  git push --force-with-lease origin "$DEFAULT_BRANCH"
  echo "Done. Everyone with an existing clone must re-clone."
else
  echo
  echo "Rewrite complete locally. Review, then publish with:"
  echo "    git push --force-with-lease origin $DEFAULT_BRANCH"
  echo "Recover the old history any time from tag: $BACKUP_TAG"
fi
