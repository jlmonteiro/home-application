---
name: github-workflow
description: >
  Manages the full GitHub development workflow: creating issues, branches, commits,
  and pull requests following team conventions. Use when the user asks to create an
  issue, open a PR, create a branch, or manage GitHub work items.
  Uses the GitHub CLI (`gh`).
---

# GitHub Workflow Guide

## Repository

- **Repo:** `jlmonteiro/home-application`
- **Default branch:** `main`
- **Branch protection:** PRs required to merge into `main`

---

## Issues

### When to create an issue
Create an issue for every piece of work before starting: features, bugs, tasks, chores.

### Issue format

**Title:** `[type] Short imperative description`

Examples:
- `[feat] Add shopping list creation endpoint`
- `[fix] Price suggestion returns null for new items`
- `[chore] Upgrade Spring Boot to 4.1`

**Body template:**
```markdown
## Context
Why this work is needed.

## Acceptance Criteria
- [ ] AC-1: ...
- [ ] AC-2: ...

## Notes
Any relevant links, SDD references, or constraints.
```

**Labels to use:**

- `feature` — New functionality
- `bug` — Something broken
- `chore` — Tooling, deps, CI
- `docs` — Documentation only
- `frontend` — React/UI work
- `backend` — Spring Boot/Java work

---

## Branches

### Naming convention
```
<type>/<issue-number>-<short-description>
```

Examples:
- `feat/42-shopping-list-endpoint`
- `fix/55-null-price-suggestion`
- `chore/60-upgrade-spring-boot`

### Workflow
1. Always branch off `main`
2. One branch per issue
3. Delete branch after PR is merged

---

## Pull Requests

### When to open
Open a PR when the feature/fix is ready for review. Link it to the issue.

### PR title
Same format as commit messages (Conventional Commits):
```
feat(shopping): add list creation endpoint (#42)
```

### PR body template
```markdown
## Summary
What this PR does and why.

## Changes
- Added `POST /api/shopping/lists` endpoint
- Liquibase migration for `shopping_lists` table

## Related
Closes #<issue-number>

## Testing
- [ ] Unit tests pass (`./gradlew test`)
- [ ] Integration tests pass
- [ ] Manually tested locally
```

### Rules
- Always use `Closes #<issue>` to auto-close the issue on merge
- Request at least 1 review before merging
- Squash merge into `main` — keep history clean
- Never force-push to `main`

---

## Workflow Summary

```
Create Issue → Create Branch → Commit (Conventional) → Open PR → Review → Squash Merge
```

---

## Using the GitHub CLI

Use `gh` commands via bash to interact with GitHub. The repo is `jlmonteiro/home-application`.

### Create an issue
```bash
gh issue create \
  --repo jlmonteiro/home-application \
  --title "[feat] Short description" \
  --body "## Context\n...\n\n## Acceptance Criteria\n- [ ] AC-1\n\n## Notes\n..." \
  --label "feature,backend"
```

### List open issues
```bash
gh issue list --repo jlmonteiro/home-application
```

### View an issue
```bash
gh issue view <number> --repo jlmonteiro/home-application
```

### Create a branch
```bash
git checkout main && git pull
git checkout -b feat/<issue-number>-<short-description>
```

### Create a pull request
```bash
gh pr create \
  --repo jlmonteiro/home-application \
  --title "feat(scope): description (#<issue>)" \
  --body "## Summary\n...\n\n## Changes\n- ...\n\n## Related\nCloses #<issue>\n\n## Testing\n- [ ] Unit tests pass\n- [ ] Integration tests pass\n- [ ] Manually tested locally" \
  --base main
```

### List open PRs
```bash
gh pr list --repo jlmonteiro/home-application
```

Always confirm the issue number and branch name with the user before running commands.
