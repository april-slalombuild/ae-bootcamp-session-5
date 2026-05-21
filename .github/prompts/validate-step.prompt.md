---
description: "Validate that all success criteria for the current step are met"
agent: code-reviewer
tools: ['search', 'read', 'execute', 'web', 'todo']
---

# Validate Step Success Criteria

You are performing systematic validation of a GitHub Issue step's success criteria. Your goal is to verify that all requirements are met before the user proceeds to the next step or commits changes.

## User Input

- **step-number** (REQUIRED): The step identifier to validate
  - Format: `"5-0"`, `"5-1"`, `"5-2"`, etc.
  - Example: `/validate-step 5-1`

**IMPORTANT**: The step number is required. If not provided, ask the user for it.

## Validation Workflow

### 1. Retrieve Issue and Step Content

Use GitHub CLI to get the exercise issue:

```bash
# Find the exercise issue (look for "Exercise:" in title)
gh issue list --state open

# Get the issue with all comments
gh issue view <issue-number> --comments
```

Reference the **Workflow Utilities** section in `.github/copilot-instructions.md` for gh CLI patterns.

### 2. Locate the Specific Step

Search through the issue content for the step:

**Pattern**: `# Step {step-number}:`

Example:
- Looking for Step 5-1: Search for `# Step 5-1:`
- The step content will include activities and success criteria

### 3. Extract Success Criteria

Locate the **Success Criteria** section within the step.

**Common patterns**:
```markdown
## Success Criteria

- [ ] Backend endpoint implemented
- [ ] Tests passing
- [ ] Frontend UI updated
- [ ] No linting errors
```

Or:

```markdown
✅ You'll know you're successful when:
- Backend DELETE endpoint returns 204
- Frontend removes todo from list on delete
- All tests passing
```

### 4. Validate Each Criterion

For each success criterion, check the workspace state:

#### Backend Criteria

Check backend implementation and tests:
```bash
# Run backend tests
cd packages/backend && npm test

# Check for lint errors
cd packages/backend && npm run lint

# Verify endpoint exists
grep -n "DELETE\|PUT\|POST\|GET" packages/backend/src/app.js
```

**Verify**:
- ✅ API endpoint implemented
- ✅ Tests passing
- ✅ Proper error handling
- ✅ Correct HTTP status codes

#### Frontend Criteria

Check frontend implementation and tests:
```bash
# Run frontend tests
cd packages/frontend && npm test

# Check for lint errors
cd packages/frontend && npm run lint
```

**Verify**:
- ✅ UI components render correctly
- ✅ User interactions work
- ✅ Component tests passing
- ✅ No console errors

#### UI Test Criteria

If the step requires UI testing:
```bash
# Verify UI tests exist
ls packages/frontend/tests/ui/*.spec.js

# Check if UI tests were run (look in chat history)
# User should have run /run-ui-tests successfully
```

**Verify**:
- ✅ Playwright tests created
- ✅ UI tests passing (from /run-ui-tests output)
- ✅ Critical journeys covered

#### Code Quality Criteria

Check for code quality issues:
```bash
# Check for linting errors in both packages
cd packages/backend && npm run lint
cd packages/frontend && npm run lint

# Verify no uncommitted changes (if criteria requires clean state)
git status
```

**Verify**:
- ✅ No ESLint errors (if step requires)
- ✅ Code follows project patterns
- ✅ No obvious code smells

### 5. Generate Validation Report

Create a clear, actionable report:

#### All Criteria Met (Success)

```markdown
## Step {step-number} Validation ✅

All success criteria have been met:

✅ **Backend Implementation**
- DELETE endpoint implemented and returning 204
- Integration tests passing (15/15)
- No lint errors

✅ **Frontend Implementation**
- Delete button added to UI
- Component tests passing (8/8)
- No lint errors

✅ **UI Testing**
- Playwright test created for delete journey
- UI tests passing (5/5)
- Critical flows validated

✅ **Code Quality**
- Zero linting errors
- Follows project patterns
- Memory notes updated

---

## Next Steps

You're ready to commit your changes:

1. `/commit-and-push feature/step-{step-number}` - Commit and push to feature branch
2. Proceed to next step in the exercise
```

#### Partial Completion (Incomplete)

```markdown
## Step {step-number} Validation ⚠️

Some success criteria are not yet met:

✅ **Backend Implementation**
- DELETE endpoint implemented
- Integration tests passing

❌ **Frontend Implementation**
- Delete button exists
- ⚠️ Component tests failing (2/8)
  - Test: "should remove todo from list" is failing
  - Error: Element not found after delete
- No lint errors

❌ **UI Testing**
- ⚠️ UI tests not yet created
- Action required: Run `/create-ui-tests` first

⏸️ **Code Quality**
- Blocked by test failures above

---

## Required Actions

Before proceeding:

1. **Fix failing component test**: Update test selector or fix delete logic
2. **Create UI tests**: Run `/create-ui-tests` to generate Playwright tests
3. **Run UI tests**: Run `/run-ui-tests` to validate UI journeys
4. **Re-validate**: Run `/validate-step {step-number}` again

Fix these issues, then re-run validation.
```

### 6. Provide Specific Guidance

For any incomplete criterion:
- **Explain what's missing**: Specific test, file, or behavior
- **Explain why it matters**: How it relates to success criteria
- **Provide next action**: Exact command or steps to resolve
- **Reference resources**: Link to docs, patterns, or examples

## Common Validation Patterns

### Pattern 1: Tests Not Passing

```markdown
❌ **Tests Failing**

Backend tests: 14/15 passing
- Failing: DELETE /api/todos/:id should return 204

**Root Cause**: Endpoint returns 500 when ID doesn't exist

**Action**:
Add ID validation in packages/backend/src/app.js:
\`\`\`javascript
const todo = service.getTodoById(id);
if (!todo) {
  return res.status(404).json({ error: 'Todo not found' });
}
\`\`\`
```

### Pattern 2: Missing UI Tests

```markdown
❌ **UI Tests Not Created**

The step requires Playwright tests for delete journey, but no UI tests exist.

**Action**:
Run `/create-ui-tests` to generate tests for:
- Create todo journey
- Delete todo journey
- Error handling
```

### Pattern 3: Linting Errors

```markdown
❌ **Code Quality Issues**

ESLint errors: 5 issues found
- packages/frontend/src/App.js: no-console (3 occurrences)
- packages/backend/src/app.js: no-unused-vars (2 occurrences)

**Action**:
This step requires clean linting. Fix these issues before committing.

Run `/lint-fix` (if available) or manually resolve:
- Remove console.log statements
- Remove unused variables
```

## Integration with Workflow

This prompt is typically used:

1. **After `/execute-step`** completes activities
2. **After `/create-ui-tests`** and `/run-ui-tests`** (if required)
3. **Before `/commit-and-push`**

**Typical Flow**:
```
/execute-step → [complete activities]
/create-ui-tests → [if required]
/run-ui-tests → [if required]
/validate-step {step-number} → [verify criteria] ← YOU ARE HERE
/commit-and-push feature/step-{step-number} → [if validation passes]
```

## Key Reminders

1. **Step Number Required**: Always ask if not provided
2. **Check Everything**: Backend, frontend, UI tests, code quality
3. **Be Specific**: Point to exact files, lines, or issues
4. **Actionable Guidance**: Tell user exactly what to do next
5. **Celebrate Success**: Clearly mark when criteria are met ✅
6. **Block on Failures**: Don't recommend commit if validation fails

---

**You are the quality gatekeeper. Ensure every criterion is met before allowing the user to proceed.**
