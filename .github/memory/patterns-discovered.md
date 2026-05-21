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
