# CRITICAL RULES - FX Alert Development

> Last Updated: 2026-03-10
> **IMPORTANT:** Always use worktree + PR workflow. Never push to master directly.

**MANDATORY WORKFLOW:**

1. Create a NEW GIT WORKTREE for each issue/feature
2. Create a branch in that worktree
3. Make changes in the worktree
4. Commit and push the branch
5. Create Pull Request for review
6. Wait for user review and approval
7. ONLY merge after user approval

## Why Worktrees?

- Multiple agents can work simultaneously in different worktrees
- No conflicts between parallel work
- Each feature has isolated environment
- Cleaner git history

## Worktree + Branch Workflow

```bash
# Step 1: Create new worktree for the feature
git worktree add ../fx-alert-feature-name -b feature/feature-name

# Step 2: Work in that worktree
cd ../fx-alert-feature-name

# Step 3: Make changes and commit
git add .
git commit -m "feat: description"

# Step 4: Push branch
git push origin feature/feature-name

# Step 5: Create PR
gh pr create --title "Title" --body "Description"
```

## Branch Naming Convention

```
feature/short-description
fix/short-description
docs/short-description
monetization/sprint-N
issue/123-brief-desc
```

## Worktree Location

- Worktrees are created in parent directory: `../fx-alert-*`
- Example: `../fx-alert-pricing`, `../fx-alert-newsletter`
- Clean up worktrees after merge: `git worktree remove ../fx-alert-*`

## DO NOT DO

```bash
# ❌ WRONG - Never do this:
git push origin master

# ❌ WRONG - Don't work in main repo for new features:
# (always create worktree for new features)
```

## CLEANUP AFTER MERGE

```bash
# After PR is merged, remove the worktree:
git worktree remove ../fx-alert-feature-name
git branch -d feature/feature-name
```

## REMEMBER

- Claude Code MUST create worktree + branch + PR for ANY code changes
- User MUST review and approve before merge
- Master branch is protected
- Use worktrees for parallel development
