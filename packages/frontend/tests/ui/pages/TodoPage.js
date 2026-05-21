// Page Object for TODO application
class TodoPage {
  constructor(page) {
    this.page = page;
  }

  // Locators - Accessibility-first selectors
  get todoInput() {
    return this.page.getByPlaceholder('What needs to be done?');
  }

  get addButton() {
    return this.page.getByRole('button', { name: /add/i });
  }

  get errorMessage() {
    return this.page.getByRole('alert').or(this.page.getByText(/required|cannot be empty/i));
  }

  todoItem(title) {
    return this.page.getByText(title, { exact: false });
  }

  todoCheckbox(title) {
    // Find checkbox near the todo text
    return this.page.locator(`li:has-text("${title}") input[type="checkbox"]`).first();
  }

  deleteButtonForTodo(title) {
    // Find delete button (aria-label="delete") near the todo text
    return this.page.locator(`li:has-text("${title}") button[aria-label="delete"]`).first();
  }

  editButtonForTodo(title) {
    // Find edit button (aria-label="edit") near the todo text
    return this.page.locator(`li:has-text("${title}") button[aria-label="edit"]`).first();
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'save' });
  }

  cancelButton() {
    return this.page.getByRole('button', { name: 'cancel' });
  }

  editInputField() {
    // TextField that appears when editing (inside list item)
    return this.page.locator('li input[type="text"]').first();
  }

  // Actions
  async goto() {
    await this.page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  }

  async addTodo(title) {
    await this.todoInput.fill(title);
    await this.addButton.click();
  }

  async deleteTodo(title) {
    await this.deleteButtonForTodo(title).click();
  }

  async toggleTodo(title) {
    await this.todoCheckbox(title).click();
  }

  async editTodo(oldTitle, newTitle) {
    await this.editButtonForTodo(oldTitle).click();
    await this.editInputField().fill(newTitle);
    await this.saveButton().click();
  }

  async submitEmptyTodo() {
    await this.todoInput.clear();
    await this.addButton.click();
  }

  // State verification helpers
  async waitForTodoVisible(title) {
    await this.todoItem(title).waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForTodoHidden(title) {
    await this.todoItem(title).waitFor({ state: 'hidden', timeout: 5000 });
  }

  async isTodoCompleted(title) {
    const checkbox = this.todoCheckbox(title);
    return await checkbox.isChecked();
  }

  async getTodoCount() {
    // Count list items in the todo list
    return await this.page.locator('ul li').count();
  }
}

module.exports = { TodoPage };
