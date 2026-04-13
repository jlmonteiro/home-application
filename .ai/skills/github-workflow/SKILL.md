---
name: github-workflow
description: >
  Manages the full GitHub development workflow: creating issues, branches, commits,
  and pull requests following team conventions. Use when the user asks to create an
  issue, open a PR, create a branch, or manage GitHub work items.
  Requires the GitHub MCP server to be configured.
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

```bash
git checkout main && git pull
git checkout -b feat/<issue-number>-<description>
```

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

## Using GitHub MCP Tools

When the user asks to create an issue, branch, or PR, use the GitHub MCP tools directly:

- **Create issue:** use `create_issue` with title, body, and labels
- **Create branch:** use `create_branch` from `main`
- **Create PR:** use `create_pull_request` with title, body, base `main`, and `Closes #N` in body
- **List issues:** use `list_issues` to find open work
- **Get issue:** use `get_issue` to read details before starting work

Always confirm the issue number and branch name with the user before creating GitHub resources.
