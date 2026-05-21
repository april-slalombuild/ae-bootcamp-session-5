// Page Object for TODO application
class TodoPage {
  constructor(page) {
    this.page = page;
  }

  // Locators - Accessibility-first selectors
  get todoInput() {
    return this.page.getByRole('textbox', { name: /todo|task/i });
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
    return this.page.getByRole('checkbox', { name: new RegExp(title, 'i') });
  }

  deleteButton(title) {
    return this.page.getByRole('button', { name: new RegExp(`delete.*${title}`, 'i') })
      .or(this.page.locator(`button:near(:text("${title}"))`).filter({ hasText: /delete/i }));
  }

  editButton(title) {
    return this.page.getByRole('button', { name: new RegExp(`edit.*${title}`, 'i') })
      .or(this.page.locator(`button:near(:text("${title}"))`).filter({ hasText: /edit/i }));
  }

  editInput(title) {
    return this.page.getByRole('textbox', { name: new RegExp(title, 'i') });
  }

  saveButton() {
    return this.page.getByRole('button', { name: /save/i });
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
    await this.deleteButton(title).first().click();
  }

  async toggleTodo(title) {
    await this.todoCheckbox(title).click();
  }

  async editTodo(oldTitle, newTitle) {
    await this.editButton(oldTitle).first().click();
    await this.editInput(oldTitle).fill(newTitle);
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
    return await this.page.locator('[role="listitem"]').count();
  }
}

module.exports = { TodoPage };
