---
description: "Create UI tests for required critical user journeys"
agent: test-engineer
tools: ['search', 'read', 'edit', 'execute', 'todo']
---

# Create UI Tests for Critical Journeys

You are creating Playwright UI tests for critical user journeys. Your goal is to generate stable, maintainable tests that validate end-to-end user flows while staying within scope boundaries.

## User Input

- **journeys** (optional): Specific user journeys to test
  - If not provided, use the default set (see below)
  - Examples: "create and delete", "error validation", "toggle completion"

## Default Test Scope

If journeys are not specified, create tests for:

1. **Create Journey**: User adds a new todo
2. **Edit Journey**: User modifies an existing todo (if edit feature exists)
3. **Toggle Journey**: User marks todo as complete/incomplete
4. **Delete Journey**: User removes a todo
5. **Error Handling**: User encounters validation errors (e.g., empty title)

**Include at least 1 error-path test** to validate error state handling.

## CRITICAL SCOPE BOUNDARY

**HARD LIMIT**: Create a **maximum of 5 Playwright tests** in this run.

**Target**: 3-5 total test cases (`test(...)` or `it(...)` blocks)

### Why This Limit?

- Focus on highest-value critical paths
- Prevent test suite bloat
- Maintain test execution speed
- Ensure tests remain maintainable

### What If More Scenarios Exist?

If more than 5 candidate scenarios exist:
1. **Select the highest-risk 5** based on:
   - User-facing impact
   - Frequency of use
   - Complexity of interaction
   - Risk of regression
2. **List deferred scenarios** for future iterations
3. **Do NOT create additional tests beyond 5**

### Verification Before Finishing

Before completing:
1. Count the total number of `test(...)` or `it(...)` blocks created/updated
2. If count > 5, reduce to the 5 highest-priority scenarios
3. Do NOT claim "small scope" if the final count exceeds 5

## Test Creation Workflow

### 1. Assess Current Test State

Check what UI tests already exist:

```bash
# List existing UI tests
ls packages/frontend/tests/ui/

# Check for existing page objects
ls packages/frontend/tests/ui/pages/
```

Understand:
- What's already tested?
- What gaps exist?
- What page objects are available?

### 2. Apply Page Object Model (POM)

**CRITICAL PATTERN**: Separate HOW (page objects) from WHAT (tests)

#### Page Object Structure

```
packages/frontend/tests/ui/
├── pages/
│   ├── TodoPage.js          # Main page object
│   └── components/
│       └── TodoItem.js      # Component-level helpers (optional)
├── e2e.spec.js              # Test scenarios
└── fixtures/
    └── testData.js          # Test data (optional)
```

#### What Goes in Page Objects

Create or update page objects with:
- ✅ **Locators** (getters for elements)
- ✅ **Actions** (methods for interactions like `addTodo`, `deleteTodo`)
- ✅ **Navigation** (goto, waitFor methods)
- ✅ **State checks** (helper methods for common assertions)

**Example Page Object**:
```javascript
// packages/frontend/tests/ui/pages/TodoPage.js
class TodoPage {
  constructor(page) {
    this.page = page;
  }
  
  // Locators
  get todoInput() {
    return this.page.getByRole('textbox', { name: /add todo/i });
  }
  
  get addButton() {
    return this.page.getByRole('button', { name: /add/i });
  }
  
  todoItem(title) {
    return this.page.getByText(title);
  }
  
  deleteButton(title) {
    return this.page.getByRole('button', { name: `Delete ${title}` });
  }
  
  // Actions
  async goto() {
    await this.page.goto('http://localhost:3000');
  }
  
  async addTodo(title) {
    await this.todoInput.fill(title);
    await this.addButton.click();
  }
  
  async deleteTodo(title) {
    await this.deleteButton(title).click();
  }
  
  async waitForTodoVisible(title) {
    await this.todoItem(title).waitFor({ state: 'visible' });
  }
}

module.exports = { TodoPage };
```

#### What Stays in Test Files

Test files should contain:
- ✅ **Test descriptions** (what user journey is being tested)
- ✅ **Arrange-Act-Assert** flow (setup, action, verify)
- ✅ **Explicit assertions** with `expect()`
- ✅ **Test isolation** (beforeEach setup)

**Example Test File**:
```javascript
// packages/frontend/tests/ui/e2e.spec.js
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo App - Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('Journey: Create and delete todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    
    // Create
    await todoPage.addTodo('Buy groceries');
    await todoPage.waitForTodoVisible('Buy groceries');
    
    // Verify creation
    await expect(todoPage.todoItem('Buy groceries')).toBeVisible();
    
    // Delete
    await todoPage.deleteTodo('Buy groceries');
    await todoPage.waitForTodoHidden('Buy groceries');
    
    // Verify deletion
    await expect(todoPage.todoItem('Buy groceries')).not.toBeVisible();
  });
  
  // Max 4 more tests (total 5)
});
```

### 3. Use Stable Selectors

**Priority Order** (most to least stable):

1. **Accessibility roles** (BEST - semantic, resilient)
   ```javascript
   page.getByRole('button', { name: 'Delete' })
   page.getByRole('textbox', { name: /add todo/i })
   page.getByRole('checkbox', { name: 'Task 1' })
   ```

2. **Labels and text content**
   ```javascript
   page.getByLabel('Todo title')
   page.getByText('Buy groceries')
   page.getByPlaceholder('Enter todo...')
   ```

3. **Test IDs** (stable, requires markup)
   ```javascript
   page.getByTestId('todo-item-1')
   ```

4. **CSS selectors** (AVOID - brittle)
   ```javascript
   // ❌ Avoid
   page.locator('.todo-list > .todo-item')
   ```

### 4. Use State-Based Waits

**✅ Good - Wait for specific conditions**:
```javascript
await page.getByText('Success').waitFor({ state: 'visible' });
await page.getByText('Loading...').waitFor({ state: 'hidden' });
await page.waitForLoadState('networkidle');
```

**❌ Bad - Arbitrary timeouts**:
```javascript
await page.waitForTimeout(2000); // Flaky!
```

### 5. Ensure Test Isolation

Each test should be independent:

```javascript
test.beforeEach(async ({ page }) => {
  // Reset to known state before each test
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
});

test('test 1', async ({ page }) => {
  // Independent - doesn't rely on test 2
});

test('test 2', async ({ page }) => {
  // Independent - doesn't rely on test 1
});
```

## Test Scenarios to Cover

### High-Priority Scenarios (Choose 5 Max)

1. **Create Todo Journey**
   - User enters title and submits
   - Todo appears in list
   - Input is cleared after submit

2. **Delete Todo Journey**
   - User clicks delete button
   - Todo is removed from list
   - List updates correctly

3. **Toggle Completion Journey**
   - User clicks checkbox
   - Todo is marked as complete
   - Visual indication changes

4. **Edit Todo Journey** (if edit feature exists)
   - User clicks edit button
   - User modifies title
   - Changes are saved and displayed

5. **Error Validation Journey**
   - User tries to submit empty title
   - Error message displays
   - Todo is not added

### Deferred Scenarios (If Limit Reached)

If you've reached 5 tests, list additional valuable scenarios for future work:
- **Persistence**: Refresh page and verify todos remain
- **Bulk operations**: Delete all, complete all
- **Filtering**: Filter by completed/incomplete
- **Edge cases**: Very long titles, special characters

## Completion Report

After creating tests, provide a summary:

```markdown
## UI Tests Created ✅

**Files Modified**:
- `packages/frontend/tests/ui/pages/TodoPage.js` (created/updated)
- `packages/frontend/tests/ui/e2e.spec.js` (created/updated)

**Test Count**: 5 tests (within limit ✅)

**Scenarios Covered**:
1. ✅ Create todo journey
2. ✅ Delete todo journey
3. ✅ Toggle completion journey
4. ✅ Edit todo journey (inline editing)
5. ✅ Error validation journey (empty title)

**Page Object Features**:
- Stable accessibility-first selectors
- Reusable action methods (addTodo, deleteTodo, etc.)
- State-based wait helpers

**Deferred Scenarios** (for future iterations):
- Persistence after refresh
- Bulk delete operation
- Filter by completion status

---

## Next Steps

1. **Run UI tests**: `/run-ui-tests` - Validate tests pass
2. **Fix failures**: Address any test failures before proceeding
3. **Validate step**: `/validate-step {step-number}` - Verify success criteria
```

## Error Prevention

### If More Than 5 Tests Would Be Created

```markdown
⚠️ **Scope Boundary Reached**

You've identified 8 potential test scenarios, but the limit is 5 tests.

**Prioritized Scenarios** (creating these 5):
1. Create todo (HIGH - core functionality)
2. Delete todo (HIGH - core functionality)
3. Toggle completion (HIGH - frequent user action)
4. Error validation (HIGH - prevents bad data)
5. Edit todo (MEDIUM - important but less frequent)

**Deferred Scenarios** (not creating now):
6. Persistence after refresh (MEDIUM)
7. Bulk operations (LOW)
8. Special character handling (LOW)

This keeps the test suite focused and maintainable.
```

## Key Reminders

1. **Maximum 5 Tests**: Hard limit per run
2. **Page Object Pattern**: Separate interactions from assertions
3. **Stable Selectors**: Accessibility roles first
4. **State-Based Waits**: No arbitrary timeouts
5. **Test Isolation**: Independent, repeatable tests
6. **Error Path Coverage**: Include at least 1 error scenario
7. **Document Deferred Scenarios**: List what's not being created

---

**You are a UI test architect. Create focused, stable tests that validate critical journeys while respecting scope boundaries.**
