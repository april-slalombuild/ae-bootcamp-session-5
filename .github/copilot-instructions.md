# Copilot Instructions - TODO Application

## Project Context

This is a full-stack TODO application with:
- **Frontend**: React application with modern UI
- **Backend**: Express.js REST API
- **Development Approach**: Iterative, feedback-driven development
- **Current Phase**: Backend stabilization and frontend feature completion

The project emphasizes test-driven development, incremental changes, and systematic validation.

## Documentation References

Consult these documentation files to understand the project:

- [docs/project-overview.md](../docs/project-overview.md) - Architecture, tech stack, and project structure
- [docs/testing-guidelines.md](../docs/testing-guidelines.md) - Test patterns and standards
- [docs/workflow-patterns.md](../docs/workflow-patterns.md) - Development workflow guidance

## Development Principles

Follow these core principles when working on this project:

- **Test-Driven Development**: Follow the Red-Green-Refactor cycle
  - Write failing tests first (RED)
  - Implement minimal code to pass (GREEN)
  - Improve code quality (REFACTOR)
- **Incremental Changes**: Make small, testable modifications rather than large rewrites
- **Systematic Debugging**: Use test failures as guides to identify and fix issues
- **Validation Before Commit**: Ensure all tests pass and no lint errors exist before committing

## Testing Scope

This project uses multiple testing layers for comprehensive quality assurance:

- **Backend Testing**: Jest + Supertest for API unit and integration testing
- **Frontend Testing**: React Testing Library for component unit and integration tests
- **UI Testing**: Playwright for critical user journey end-to-end automation
- **Manual Testing**: Browser-based exploratory validation and visual checks

**Rationale**: Combine fast feedback loops (unit/integration tests) with end-to-end quality confidence (UI tests).

### Testing Approach by Context

- **Backend API changes**: 
  - Write Jest tests FIRST, then implement (RED-GREEN-REFACTOR)
  - Test API endpoints, request/response handling, and business logic
  
- **Frontend component features**: 
  - Write React Testing Library tests FIRST for component behavior
  - Implement component to pass tests (RED-GREEN-REFACTOR)
  - Follow with manual browser testing for full UI flows and visual validation

**This is true TDD**: Always write the test first, then write code to pass the test.

## Workflow Patterns

Follow these development workflows depending on the task:

1. **TDD Workflow**: 
   - Write or fix test → Run tests → See failure (RED) → Implement feature → Pass tests (GREEN) → Refactor code → Validate again

2. **Code Quality Workflow**: 
   - Run lint checks → Categorize issues by type → Fix systematically → Re-validate → Ensure zero errors

3. **Integration Workflow**: 
   - Identify integration issue → Debug with logging/tests → Create test case → Fix implementation → Verify end-to-end

4. **UI Testing Workflow**: 
   - Define critical user journeys → Create Playwright tests → Run tests → Debug failures → Validate coverage

## Agent Usage

Use specialized agent modes for different development contexts:

- **tdd-developer**: 
  - For feature implementation and unit/integration TDD cycles
  - Writes and runs Jest tests (backend) and React Testing Library tests (frontend)
  - Do NOT create or run Playwright UI tests in this mode

- **code-reviewer**: 
  - For addressing ESLint errors and code quality improvements
  - Reviews code for best practices and patterns
  - Provides systematic fixes for linting issues

- **test-engineer**: 
  - Owns all Playwright UI test authoring and execution
  - Performs failure triage and debugging
  - Validates test isolation and reliability

## Memory System

The project uses a dual-memory approach to track development knowledge:

- **Persistent Memory**: This file (`.github/copilot-instructions.md`) contains foundational principles, workflows, and project-wide standards that rarely change
- **Working Memory**: `.github/memory/` directory contains session notes, discovered patterns, and active work

### Working Memory Structure

- **`.github/memory/session-notes.md`** (committed): Historical summaries of completed development sessions documenting what was accomplished, key findings, and outcomes
- **`.github/memory/patterns-discovered.md`** (committed): Accumulated code patterns, architectural decisions, and solutions to recurring problems
- **`.github/memory/scratch/working-notes.md`** (NOT committed): Active session workspace for real-time notes, debugging thoughts, and work-in-progress tracking

### Using the Memory System

1. **During Active Development**: Take notes in `.github/memory/scratch/working-notes.md` as you work (debugging findings, decisions, next steps)
2. **At End of Session**: Summarize key findings into `.github/memory/session-notes.md` and extract reusable patterns into `.github/memory/patterns-discovered.md`
3. **When Providing Suggestions**: AI references these files to provide context-aware recommendations based on past learnings and established patterns

See [.github/memory/README.md](.github/memory/README.md) for detailed guidance on the memory system and when to use each file during TDD, linting, debugging, and integration testing workflows.

## Workflow Utilities

Use GitHub CLI commands for workflow automation (available to all agent modes):

```bash
# List all open issues
gh issue list --state open

# Get details for a specific issue
gh issue view <issue-number>

# Get issue with all comments
gh issue view <issue-number> --comments
```

**Exercise Workflow**:
- The main exercise issue will have "Exercise:" in the title
- Development steps are posted as comments on the main issue
- Use these commands when `/execute-step` or `/validate-step` prompts are invoked

## Git Workflow

Follow these Git conventions and practices:

### Conventional Commits

Use conventional commit format for all commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring without behavior changes

**Example**: `feat: add delete functionality to TODO items`

### Branch Strategy

- **Feature branches**: `feature/<descriptive-name>`
- **Bug fixes**: `fix/<issue-description>`
- **Main branch**: Protected, always deployable

### Commit Process

1. Stage all changes: `git add .`
2. Commit with conventional format: `git commit -m "feat: description"`
3. Push to the correct branch: `git push origin <branch-name>`

Always ensure tests pass and code is linted before pushing.
