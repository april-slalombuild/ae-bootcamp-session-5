# Patterns Discovered

This file documents recurring code patterns, architectural decisions, and lessons learned during development.

## Purpose

- Maintain consistency across the codebase
- Avoid repeating mistakes
- Share solutions to common problems
- Help AI recognize and apply established patterns

## Pattern Template

Use this template when documenting a new pattern:

```markdown
### Pattern: [Pattern Name]

**Context**: [When/where this pattern applies]

**Problem**: [What problem does this solve]

**Solution**: [The approach or pattern to use]

**Example**:
\`\`\`javascript
// ❌ Bad - what to avoid
[counter-example code]

// ✅ Good - recommended approach
[example code]
\`\`\`

**Related Files**: [List of files where this pattern is used or should be applied]

**References**: [Links to docs, related patterns, or session notes]
```

---

## Discovered Patterns

### Pattern: Service Initialization with Empty Collections

**Context**: Initializing service classes that manage collections of data (todos, users, etc.)

**Problem**: Using `null` or `undefined` for initial state causes errors when code expects array or object methods to be available. This leads to cascading failures where API routes crash when trying to call `.filter()`, `.map()`, or other collection methods.

**Solution**: Always initialize collection properties with appropriate empty values:
- Use `[]` for arrays
- Use `{}` for objects
- Use `0` for counters
- Never use `null` or `undefined` for collections

**Example**:
```javascript
// ❌ Bad - causes runtime errors
class TodoService {
  constructor() {
    this.todos = null;  // Will fail: "Cannot read property 'filter' of null"
  }
  
  getAllTodos() {
    return this.todos.filter(todo => !todo.deleted);  // 💥 Error!
  }
}

// ✅ Good - safe for immediate use
class TodoService {
  constructor() {
    this.todos = [];  // Array methods work immediately
  }
  
  getAllTodos() {
    return this.todos.filter(todo => !todo.deleted);  // ✅ Works
  }
}
```

**Related Files**: 
- `packages/backend/src/services/todoService.js`
- Any other service classes that manage collections

**References**: 
- Session: "Fix Service Initialization Bug" (example)
- JavaScript best practice: Default to empty collections over null

---

### Pattern: RESTful Error Handling with 404 Status

**Context**: When implementing CRUD endpoints that operate on specific resources by ID

**Problem**: Inconsistent error responses when a resource doesn't exist can confuse frontend developers and make debugging difficult

**Solution**: Always return 404 status with descriptive error message when a resource is not found. Use consistent error object structure across all endpoints.

**Example**:
```javascript
// ❌ Bad - inconsistent error handling
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === id);
  todo.title = req.body.title; // 💥 Crashes if todo is undefined
});

// ✅ Good - consistent 404 handling
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todo.title = req.body.title;
  res.json(todo);
});
```

**Related Files**: 
- `packages/backend/src/app.js` - All ID-based endpoints (PUT, PATCH, DELETE)

**References**: 
- Step 5-1: Backend tests expect 404 for non-existent resources

---

### Pattern: Input Validation with Early Returns

**Context**: API endpoints that accept user input (POST, PUT, PATCH requests)

**Problem**: Missing or invalid input can cause server errors or data corruption

**Solution**: Validate input at the start of the handler. Use early returns to stop execution if validation fails. Return 400 status with descriptive error messages.

**Example**:
```javascript
// ❌ Bad - no validation, can create invalid data
app.post('/api/todos', (req, res) => {
  const todo = { id: nextId++, title: req.body.title, completed: false };
  todos.push(todo); // What if title is undefined?
  res.status(201).json(todo);
});

// ✅ Good - validate and fail fast
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  // Validate early, return early
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const todo = { id: nextId++, title: title.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});
```

**Related Files**: 
- `packages/backend/src/app.js` - POST and PUT endpoints

**References**: 
- Step 5-1: Tests validate both missing and empty string inputs

---

### Pattern: ID Parsing in Route Parameters

**Context**: Express routes that accept numeric IDs as URL parameters

**Problem**: Route parameters are strings by default. Comparing strings to numbers causes bugs.

**Solution**: Always parse ID parameters to integers using `parseInt()`. Handle at the start of the handler.

**Example**:
```javascript
// ❌ Bad - ID comparison might fail
app.delete('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id); // '1' !== 1
  // ...
});

// ✅ Good - consistent numeric comparison
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id); // 1 === 1
  // ...
});
```

**Related Files**: 
- `packages/backend/src/app.js` - All ID-based routes (PUT, PATCH, DELETE)

**References**: 
- Step 5-1: All ID-based endpoints use this pattern

---

### Pattern: Toggle Boolean State

**Context**: When implementing toggle functionality for boolean properties

**Problem**: Hardcoding boolean values prevents proper toggling behavior

**Solution**: Use the logical NOT operator (`!`) to flip boolean state

**Example**:
```javascript
// ❌ Bad - always sets to true, doesn't toggle
app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === id);
  todo.completed = true; // 💥 Can't toggle back to false!
  res.json(todo);
});

// ✅ Good - proper toggle
app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed; // true → false, false → true
  res.json(todo);
});
```

**Related Files**: 
- `packages/backend/src/app.js` - PATCH toggle endpoint

**References**: 
- Step 5-1: Fixed intentional toggle bug

---

### Pattern: Array Deletion with findIndex

**Context**: Removing items from an array in a CRUD operation

**Problem**: Using `.filter()` creates a new array, which doesn't work with in-memory storage. Using `.find()` and manually removing can be error-prone.

**Solution**: Use `.findIndex()` to get the index, check if found (-1), then use `.splice()` to remove in-place.

**Example**:
```javascript
// ❌ Bad - reassignment may not work in all contexts
app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== id);
  res.json({ message: 'Deleted' });
});

// ✅ Good - in-place deletion
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(index, 1);
  res.status(200).json({ message: 'Todo deleted' });
});
```

**Related Files**: 
- `packages/backend/src/app.js` - DELETE endpoint

**References**: 
- Step 5-1: DELETE implementation pattern

