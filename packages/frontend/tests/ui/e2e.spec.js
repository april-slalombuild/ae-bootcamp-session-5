// TODO App - Critical User Journey Tests
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo App - Critical User Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    // Clear any persisted state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Journey 1: Create todo', async ({ page }) => {
    const todoTitle = 'Buy groceries';

    // User adds a new todo
    await todoPage.addTodo(todoTitle);

    // Wait for todo to appear
    await todoPage.waitForTodoVisible(todoTitle);

    // Verify todo is visible in the list
    await expect(todoPage.todoItem(todoTitle)).toBeVisible();

    // Verify input is cleared after submission
    await expect(todoPage.todoInput).toHaveValue('');
  });

  test('Journey 2: Edit todo', async ({ page }) => {
    const originalTitle = 'Original task';
    const updatedTitle = 'Updated task';

    // Setup: Create a todo first
    await todoPage.addTodo(originalTitle);
    await todoPage.waitForTodoVisible(originalTitle);

    // User edits the todo
    await todoPage.editTodo(originalTitle, updatedTitle);

    // Wait for updated todo to appear
    await todoPage.waitForTodoVisible(updatedTitle);

    // Verify new title is visible
    await expect(todoPage.todoItem(updatedTitle)).toBeVisible();

    // Verify old title is no longer visible
    await expect(todoPage.todoItem(originalTitle)).not.toBeVisible();
  });

  test('Journey 3: Toggle todo completion', async ({ page }) => {
    const todoTitle = 'Task to complete';

    // Setup: Create a todo
    await todoPage.addTodo(todoTitle);
    await todoPage.waitForTodoVisible(todoTitle);

    // Verify todo starts unchecked
    const checkbox = todoPage.todoCheckbox(todoTitle);
    await expect(checkbox).not.toBeChecked();

    // User marks todo as complete
    await todoPage.toggleTodo(todoTitle);

    // Verify todo is now checked
    await expect(checkbox).toBeChecked();

    // User marks todo as incomplete
    await todoPage.toggleTodo(todoTitle);

    // Verify todo is unchecked again
    await expect(checkbox).not.toBeChecked();
  });

  test('Journey 4: Delete todo', async ({ page }) => {
    const todoTitle = 'Task to delete';

    // Setup: Create a todo
    await todoPage.addTodo(todoTitle);
    await todoPage.waitForTodoVisible(todoTitle);

    // Verify todo exists
    await expect(todoPage.todoItem(todoTitle)).toBeVisible();

    // User deletes the todo
    await todoPage.deleteTodo(todoTitle);

    // Wait for todo to disappear
    await todoPage.waitForTodoHidden(todoTitle);

    // Verify todo is no longer visible
    await expect(todoPage.todoItem(todoTitle)).not.toBeVisible();
  });

  test('Journey 5: Error validation - empty todo', async ({ page }) => {
    // User tries to submit an empty todo
    await todoPage.submitEmptyTodo();

    // Wait for error message to appear
    await expect(todoPage.errorMessage).toBeVisible({ timeout: 3000 });

    // Verify error message is displayed
    const errorText = await todoPage.errorMessage.textContent();
    expect(errorText.toLowerCase()).toMatch(/required|cannot be empty|please enter/);

    // Verify no todo was added to the list
    const todoCount = await todoPage.getTodoCount();
    expect(todoCount).toBe(0);
  });
});