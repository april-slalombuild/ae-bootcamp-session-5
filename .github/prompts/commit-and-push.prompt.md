---
description: "Analyze changes, generate commit message, and push to feature branch"
tools: ['read', 'execute', 'todo']
---

# Commit and Push Changes

You are responsible for analyzing staged changes, generating a conventional commit message, and pushing to a feature branch. This prompt works with any active agent context.

## User Input

- **branch-name** (REQUIRED): The name of the feature branch to commit and push to
  - Format: `feature/<descriptive-name>` or `fix/<issue-description>`
  - Examples: `feature/delete-functionality`, `fix/validation-errors`

**IMPORTANT**: If the user does NOT provide a branch name, ask for it before proceeding.

## Workflow

### 1. Pre-Commit Validation

Before committing, ensure quality checks are met:

#### a) Check for Required UI Testing

If the current step workflow includes UI testing requirements:
- Verify that `npm run test:ui` has been successfully run in this chat session, OR
- Require the user to run `/run-ui-tests` first

**Do not commit UI-related changes without UI test validation.**

#### b) Verify Tests Pass

Run appropriate test suites:
```bash
# Backend tests
cd packages/backend && npm test

# Frontend tests
cd packages/frontend && npm test
```

If any tests fail, STOP and report the failures. Do not proceed with commit.

### 2. Analyze Changes

Use `git diff` to understand what's changed:

```bash
# See staged and unstaged changes
git diff HEAD

# See which files changed
git status
```

Analyze:
- What features were added?
- What bugs were fixed?
- What files were modified?
- What is the primary purpose of these changes?

### 3. Generate Conventional Commit Message

Reference the **Git Workflow** section in `.github/copilot-instructions.md` for commit conventions.

**Format**: `<type>: <description>`

**Types**:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring without behavior changes

**Guidelines**:
- Use imperative mood ("add" not "added")
- Keep description concise but descriptive
- Focus on WHAT changed, not HOW
- Max 72 characters for the first line

**Examples**:
```
feat: add delete functionality for TODO items
fix: correct validation error handling in API
test: add integration tests for PUT endpoint
refactor: extract ID validation to helper function
```

### 4. Branch Management

Handle branch creation or switching:

```bash
# Check current branch
git branch --show-current

# If branch doesn't exist, create it
git checkout -b <branch-name>

# If branch exists, switch to it
git checkout <branch-name>
```

**CRITICAL SAFETY CHECK**:
- ❌ NEVER commit to `main` branch
- ❌ NEVER commit to any branch other than the user-specified branch
- ✅ ONLY use the branch name provided by the user

If currently on `main`, switch to the specified feature branch.

### 5. Stage, Commit, and Push

Execute the git workflow:

```bash
# Stage all changes
git add .

# Commit with generated message
git commit -m "<generated-message>"

# Push to the feature branch
git push origin <branch-name>
```

### 6. Confirm and Report

After successful push, report:
- ✅ Branch name used
- ✅ Commit message applied
- ✅ Number of files changed
- ✅ Remote push successful

**Example Output**:
```markdown
## Commit Successful ✅

**Branch**: `feature/delete-functionality`
**Commit**: `feat: add delete functionality for TODO items`
**Files Changed**: 4
- packages/backend/src/app.js
- packages/backend/__tests__/app.test.js
- packages/frontend/src/App.js
- packages/frontend/src/__tests__/App.test.js

**Remote**: Pushed to `origin/feature/delete-functionality`

Next steps:
- Continue with next step using `/execute-step`
- Or create a pull request if step sequence is complete
```

## Error Handling

### If Tests Fail

```markdown
❌ Cannot commit - tests are failing

**Failed Tests**:
- packages/backend/__tests__/app.test.js
  - DELETE /api/todos/:id should return 204

**Action Required**:
Fix the failing tests before committing. The TDD cycle requires all tests to pass (GREEN phase) before committing.
```

### If No Branch Name Provided

```markdown
❌ Branch name is required

Please provide a feature branch name:
/commit-and-push <branch-name>

Suggested formats:
- feature/delete-functionality
- fix/validation-error
- feature/step-5-1-delete
```

### If On Main Branch

```markdown
⚠️ Currently on main branch

Switching to feature branch: <user-specified-branch>

Creating branch if it doesn't exist...
```

## Integration with Workflow

This prompt is typically used:

1. **After `/execute-step`** completes activities
2. **After `/validate-step`** confirms success criteria
3. **Before moving to the next step**

**Typical Flow**:
```
/execute-step → [complete activities]
/create-ui-tests → [if required]
/run-ui-tests → [if required]
/validate-step {step-number} → [verify criteria]
/commit-and-push feature/step-5-1 → [save progress]
```

## Key Reminders

1. **Branch Name Required**: Always ask if not provided
2. **Test First**: All tests must pass before committing
3. **Conventional Commits**: Follow the project's commit format
4. **Feature Branches Only**: Never commit to main
5. **Clear Messages**: Describe what changed, not how
6. **UI Test Validation**: Check UI tests if applicable

---

**You are the commit gatekeeper. Ensure quality, follow conventions, and push to the correct branch.**
