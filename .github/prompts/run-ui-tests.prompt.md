---
description: "Run UI tests and summarize failures"
agent: test-engineer
tools: ['read', 'execute', 'todo']
---

# Run UI Tests and Analyze Results

You are executing the Playwright UI test suite and analyzing results. Your goal is to run tests, summarize outcomes, and classify any failures by root cause.

## User Input

- **None**: This prompt doesn't require user input

## Execution Workflow

### Step 1: Install Playwright Dependencies (REQUIRED FIRST STEP)

**CRITICAL**: Before running UI tests for the first time (or after container rebuild), install Playwright and its dependencies:

```bash
npm run test:ui:install --workspace=frontend
```

This command will:
1. Run `playwright install --with-deps chromium`
2. Include automatic bounded remediation for the common Ubuntu Yarn repository GPG key issue
3. Perform one retry if the install fails
4. Report blockers if installation still fails after remediation

**In Ubuntu/Linux environments**, `test:ui:install` is **MANDATORY** and performs the full dependency installation including system-level browser dependencies.

#### Installation Failure Handling

If `test:ui:install` fails after the automated remediation and retry:
- **STOP immediately** - do NOT proceed to run Playwright tests
- **Report an environment blocker** with:
  - The failing command
  - Key error lines from the output
  - Instructions for manual intervention if needed
- **Do NOT**:
  - Attempt ad-hoc package hunting
  - Perform broad OS troubleshooting beyond the automated fix
  - Continue to run tests after a failed dependency install

### Step 2: Ensure Servers Are Running

UI tests require both backend and frontend servers to be running:

```bash
# Check if servers are running
# Look for processes on ports 3000 (frontend) and 3001 (backend)

# If not running, start from repository root
npm start
```

**Verification**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

Wait for both servers to be fully started before proceeding.

### Step 3: Execute UI Tests

Run the Playwright test suite:

```bash
cd packages/frontend && npm run test:ui
```

**Watch the output** for:
- Total number of tests
- Pass/fail counts
- Duration
- Any error messages or stack traces

### Step 4: Analyze Test Results

After execution, summarize the results clearly:

#### All Tests Passing (Success)

```markdown
## UI Test Results ✅

**Summary**:
- Total: 5 tests
- Passed: 5 ✅
- Failed: 0
- Duration: 12.3s

**Scenarios Validated**:
1. ✅ Create todo journey
2. ✅ Delete todo journey
3. ✅ Toggle completion journey
4. ✅ Edit todo journey
5. ✅ Error validation journey

**All critical user journeys are working correctly.**

---

## Next Steps

Your UI tests are passing. Proceed with:
- `/validate-step {step-number}` - Verify all success criteria
```

#### Some Tests Failing (Needs Investigation)

```markdown
## UI Test Results ⚠️

**Summary**:
- Total: 5 tests
- Passed: 3 ✅
- Failed: 2 ❌
- Duration: 18.7s

**Passed Tests**:
1. ✅ Create todo journey
2. ✅ Toggle completion journey
3. ✅ Error validation journey

**Failed Tests**:
1. ❌ Delete todo journey
2. ❌ Edit todo journey

---

## Failure Analysis

[Continue with Step 5 below]
```

### Step 5: Classify Failures by Root Cause

For each failure, determine the category:

#### Category 1: Application Bug 🐛

**Symptoms**: Test is correct, but application doesn't work as expected

**Example**:
```markdown
### ❌ Test: "Delete todo journey"

**Failure Output**:
```
Error: expect(locator).not.toBeVisible()
Expected: not visible
Received: visible
```

**Analysis**:
- Test clicks delete button correctly
- API returns 204 status
- Frontend still shows the todo in the list

**Root Cause**: 🐛 **APPLICATION BUG**
- Frontend doesn't update state after successful delete
- UI not re-rendering after API call

**Recommended Fix**:
Update `packages/frontend/src/App.js`:
- Verify state update after delete API call
- Ensure component re-renders with updated todo list
- Use `@tdd-developer` to fix the implementation
```

#### Category 2: Test Bug 🧪

**Symptoms**: Test has incorrect expectations or uses brittle selectors

**Example**:
```markdown
### ❌ Test: "Edit todo journey"

**Failure Output**:
```
Error: locator.click: Timeout 30000ms exceeded.
waiting for locator('.edit-btn')
```

**Analysis**:
- Application edit functionality works in manual testing
- Element exists but selector changed after UI refactor
- Test uses brittle CSS class selector

**Root Cause**: 🧪 **TEST BUG**
- Test selector is outdated/brittle
- Should use stable accessibility selector

**Recommended Fix**:
Update `packages/frontend/tests/ui/e2e.spec.js`:
\`\`\`javascript
// Before (brittle)
await page.locator('.edit-btn').click();

// After (stable)
await page.getByRole('button', { name: 'Edit' }).click();
\`\`\`

Update the page object or test file to use stable selectors.
```

#### Category 3: Environment Issue 🌍

**Symptoms**: Tests pass locally but fail in CI, or depend on external state

**Example**:
```markdown
### ❌ Test: "Create todo journey"

**Failure Output**:
```
Error: page.goto: Timeout 30000ms exceeded.
navigating to http://localhost:3000
```

**Analysis**:
- Test times out navigating to application
- Application not accessible at expected URL
- Server may not be running

**Root Cause**: 🌍 **ENVIRONMENT ISSUE**
- Development server not started
- Port conflict
- Network connectivity issue

**Recommended Fix**:
1. Verify servers are running: `npm start`
2. Check for port conflicts: `lsof -i :3000` and `lsof -i :3001`
3. Restart servers if needed
4. Re-run tests after server confirmation
```

### Step 6: Provide Actionable Recommendations

Based on failure categories, guide the user:

#### For Application Bugs (🐛)

```markdown
## Recommended Actions

**Application bugs detected** - Implementation needs fixes

1. Use `@tdd-developer` to fix the application code
2. Ensure unit/integration tests cover the bug
3. Re-run UI tests to verify fix: `/run-ui-tests`
4. Validate step: `/validate-step {step-number}`
```

#### For Test Bugs (🧪)

```markdown
## Recommended Actions

**Test bugs detected** - Test code needs updates

1. Update test selectors to use stable locators (getByRole)
2. Fix incorrect test expectations
3. Update page objects if needed
4. Re-run tests: `/run-ui-tests`
```

#### For Environment Issues (🌍)

```markdown
## Recommended Actions

**Environment issues detected** - Setup problems

1. Verify servers are running: `npm start`
2. Check for port conflicts
3. Clear browser cache/storage if needed
4. Re-run tests after environment fix: `/run-ui-tests`
```

## Debugging Workflow

If tests fail and the cause isn't obvious:

### Enable Debug Mode

```bash
# Run tests in headed mode (see browser)
npm run test:ui -- --headed

# Run tests in debug mode (step through)
npm run test:ui -- --debug

# Run single test
npm run test:ui -- -g "specific test name"
```

### Check Test Artifacts

If configured, review:
- Screenshots of failures
- Videos of test execution
- Console logs
- Network activity

### Isolate the Issue

```bash
# Run tests one at a time
npm run test:ui -- -g "Delete todo"

# Add page.pause() in test for manual inspection
# Check browser dev tools during test execution
```

## Common Failure Patterns

### Pattern: Timeout Waiting for Element

**Likely Cause**: Test bug (brittle selector) or app bug (element not rendering)

**Investigation**:
1. Does element exist when you test manually?
2. Did selector change after UI refactor?
3. Is there a timing issue (element loads slowly)?

### Pattern: Element Not Visible

**Likely Cause**: App bug (state not updating) or test bug (wrong expectation)

**Investigation**:
1. Check browser dev tools - is element in DOM?
2. Verify application state updates correctly
3. Check if test expectations match actual behavior

### Pattern: Network Timeout

**Likely Cause**: Environment issue (server not running) or app bug (API error)

**Investigation**:
1. Are both frontend and backend servers running?
2. Check API endpoint returns expected response
3. Look for CORS or network errors in console

## Memory Integration

Document test results in `.github/memory/scratch/working-notes.md`:

```markdown
## UI Test Execution

**Date**: [timestamp]
**Command**: npm run test:ui

**Results**:
- Total: 5 tests
- Passed: 3 ✅
- Failed: 2 ❌

**Failures**:
1. Delete journey - 🐛 Application bug (state not updating)
2. Edit journey - 🧪 Test bug (brittle selector)

**Actions Taken**:
- Identified root causes for both failures
- Recommended fixes to user
- Next: Fix app bug, then re-run tests
```

## Key Reminders

1. **Install First**: Run `test:ui:install` before first test execution
2. **Servers Must Run**: Both frontend and backend must be accessible
3. **Classify Failures**: App bug vs test bug vs environment
4. **Be Specific**: Point to exact test, file, line, and error
5. **Actionable Guidance**: Tell user exactly what to fix
6. **Re-run After Fixes**: Verify fixes resolve failures

---

**You are the test execution specialist. Run tests systematically, classify failures accurately, and guide users to resolution.**
