# Working Memory System

## Purpose

This memory system tracks patterns, decisions, and lessons learned during development. It serves as a living knowledge base that helps both developers and AI understand the project's evolution, accumulated wisdom, and active work.

## Memory Types

The project maintains two types of memory:

### 1. Persistent Memory (`.github/copilot-instructions.md`)

- **Location**: `.github/copilot-instructions.md`
- **Purpose**: Foundational principles, workflows, and standards
- **Content**: Project context, development principles, testing scope, workflow patterns, agent usage guidelines
- **Lifecycle**: Long-term, rarely changes, committed to git
- **When to Update**: When establishing new project-wide conventions or workflow changes

### 2. Working Memory (`.github/memory/`)

- **Location**: `.github/memory/` directory
- **Purpose**: Discoveries, patterns, and active session notes
- **Content**: Session summaries, code patterns, temporary working notes
- **Lifecycle**: Grows continuously, mix of committed and ephemeral content
- **When to Update**: During and after each development session

## Directory Structure

```
.github/memory/
├── README.md                     # This file - explains the memory system
├── session-notes.md              # Historical session summaries (COMMITTED)
├── patterns-discovered.md        # Accumulated code patterns (COMMITTED)
└── scratch/
    ├── .gitignore                # Ignores all scratch files
    └── working-notes.md          # Active session notes (NOT COMMITTED)
```

## File Purposes

### `session-notes.md` (Committed)

**Purpose**: Document completed development sessions for future reference

**Content**:
- Session name and date
- What was accomplished
- Key findings and decisions
- Outcomes and validation results

**Update Timing**: At the end of each development session, summarize key findings from `scratch/working-notes.md`

**Example Use Cases**:
- "What approach did we try for validation that didn't work?"
- "When did we discover the service initialization pattern?"
- "What was the outcome of the lint error cleanup session?"

### `patterns-discovered.md` (Committed)

**Purpose**: Document recurring code patterns, anti-patterns, and architectural decisions

**Content**:
- Pattern name and context
- Problem the pattern solves
- Solution approach
- Code examples
- Related files where pattern applies

**Update Timing**: When you discover a reusable pattern or solve a problem that might recur

**Example Use Cases**:
- "How should we initialize service data structures?"
- "What's the standard way to handle API errors in this project?"
- "What testing pattern do we use for async operations?"

### `scratch/working-notes.md` (NOT Committed)

**Purpose**: Active session workspace for real-time notes, debugging thoughts, and work-in-progress tracking

**Content**:
- Current task and approach
- Key findings during debugging
- Decisions made and rationale
- Blockers and questions
- Next steps

**Update Timing**: Continuously during active development session

**Cleanup**: At session end, extract important findings into `session-notes.md` and `patterns-discovered.md`, then clear for next session

**Example Use Cases**:
- "What test failure am I currently investigating?"
- "What debugging steps have I tried so far?"
- "What's my hypothesis for this bug?"
- "What are the three approaches I'm considering?"

## When to Use Each File

### During TDD Workflow

1. **Starting Work**: Open `scratch/working-notes.md` and note your current task
2. **Red Phase**: Note the failing test and expected behavior
3. **Green Phase**: Document your implementation approach
4. **Refactor Phase**: Note any patterns you discover
5. **Session End**: Extract pattern into `patterns-discovered.md`, summarize session in `session-notes.md`

### During Linting Workflow

1. **Starting**: Note error categories in `scratch/working-notes.md`
2. **Investigation**: Document root causes and systematic fix approach
3. **Pattern Discovery**: If you find a recurring issue type, note the pattern
4. **Session End**: Document the lint pattern in `patterns-discovered.md` with examples

### During Debugging Workflow

1. **Problem Identification**: Note symptoms in `scratch/working-notes.md`
2. **Hypothesis Testing**: Track hypotheses and test results
3. **Root Cause**: Document findings
4. **Solution**: Note the fix and why it works
5. **Session End**: If it's a useful pattern, extract to `patterns-discovered.md`

### During Integration Testing

1. **Test Creation**: Note user journey being tested
2. **Debugging Failures**: Track selectors, timing issues, or state problems
3. **Pattern Discovery**: Document working patterns (e.g., stable selectors, wait strategies)
4. **Session End**: Add integration patterns to `patterns-discovered.md`

## How AI Uses the Memory System

### During Development

When you're working with AI (GitHub Copilot, custom agents):

1. **AI Reads Persistent Memory First**: The agent loads `.github/copilot-instructions.md` to understand foundational principles
2. **AI Consults Working Memory**: The agent references `patterns-discovered.md` and `session-notes.md` for context
3. **AI Updates Working Notes**: During debugging or TDD, AI can suggest adding findings to `scratch/working-notes.md`
4. **AI Applies Learned Patterns**: When AI sees similar code, it suggests the documented patterns

### Pattern Recognition

AI uses `patterns-discovered.md` to:
- Recognize when a similar problem appears
- Suggest the established pattern automatically
- Avoid suggesting approaches that were tried and didn't work
- Maintain consistency across the codebase

### Historical Context

AI uses `session-notes.md` to:
- Understand what's been tried before
- Recall decisions and their rationale
- Avoid repeating failed approaches
- Build on successful strategies

## Memory Workflow Example

### Example Session: Fixing Service Initialization Bug

#### 1. Start of Session (in `scratch/working-notes.md`)

```markdown
## Current Task
Fix bug where TODO items don't render after server restart

## Approach
- Check backend initialization
- Verify data structure
- Test API response

## Key Findings
- Service starts with `null` instead of empty array
- Causes API to return 500 error
- Frontend can't handle null response

## Decisions Made
- Change initialization from `null` to `[]`
- Add validation in API routes
- Add null check in frontend

## Next Steps
- Write test for edge case
- Verify fix works
```

#### 2. End of Session - Extract to `session-notes.md`

```markdown
### Session: Fix Service Initialization Bug (2026-05-21)

**Accomplished**:
- Identified null initialization causing API errors
- Fixed service initialization to use empty array
- Added tests for edge case

**Key Findings**:
- Services should initialize with appropriate empty values ([], {})
- Null causes cascading failures in API routes
- Frontend needs defensive null checks

**Outcomes**:
- All tests passing
- Bug fixed and verified
```

#### 3. Extract Pattern to `patterns-discovered.md`

```markdown
### Pattern: Service Initialization with Empty Collections

**Context**: Initializing service classes that manage collections

**Problem**: Using `null` for initial state causes errors when operations expect array methods

**Solution**: Always initialize collections with empty arrays or objects

**Example**:
\`\`\`javascript
// ❌ Bad - causes errors
class TodoService {
  constructor() {
    this.todos = null;  // Will fail when calling .filter(), .map(), etc.
  }
}

// ✅ Good - safe for operations
class TodoService {
  constructor() {
    this.todos = [];  // Array methods work immediately
  }
}
\`\`\`

**Related Files**: `packages/backend/src/services/todoService.js`
```

## Best Practices

1. **Be Specific**: Include code examples and file references in patterns
2. **Be Concise**: Working notes are rough; session summaries are polished
3. **Be Honest**: Document what didn't work, not just successes
4. **Be Consistent**: Use the templates provided
5. **Be Timely**: Update memory while context is fresh
6. **Clean Regularly**: Clear `scratch/working-notes.md` at session end after extracting key findings

## Integration with Git

- **Committed Files**: `README.md`, `session-notes.md`, `patterns-discovered.md`
  - These provide historical context and accumulated wisdom
  - Shared with the team
  
- **Not Committed**: `scratch/` directory contents
  - Active work is personal and ephemeral
  - `.gitignore` prevents accidental commits
  - Cleared after each session

This separation keeps committed history clean while preserving important learnings.
