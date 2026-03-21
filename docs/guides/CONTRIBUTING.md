# Contributing to CRM Tools Widget Extension

Thank you for your interest in contributing to the CRM Tools Widget Extension!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and professional environment for all contributors and users.

### Our Standards
- Be respectful and inclusive in all interactions
- Provide constructive feedback
- Focus on what is best for the project and team
- Show empathy towards other contributors and users

### Unacceptable Behavior
- Harassment, discrimination, or intimidation of any kind
- Personal attacks or derogatory comments
- Publishing others' private information without permission
- Other conduct deemed inappropriate in a professional setting

---

## Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on the repository page
   - Clone your fork locally:
     ```bash
     git clone https://github.com/jlicerio/crm-script-manager-extension.git
     cd crm-script-manager-extension
     ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/jlicerio/crm-script-manager-extension.git
   ```

3. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

---

## Development Setup

### Prerequisites
- Google Chrome (latest version) or Microsoft Edge
- Git
- Text editor or IDE (VS Code recommended)

### Load Extension for Development

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **Pack extension** (if previously packed) or use **Load unpacked**
4. Select the `crm-tools-chrome-store/` directory
5. Click **Reload** after making changes

### Recommended VS Code Extensions
- ESLint - JavaScript linting
- Prettier - Code formatting
- Live Server - Local development server (for test files)

---

## Making Changes

### Branch Naming Convention

Use descriptive branch names:
- `feature/` - New features (e.g., `feature/voice-input-enhancement`)
- `bugfix/` - Bug fixes (e.g., `bugfix/fix-chat-scroll-issue`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### Example:
```bash
git checkout -b feature/add-dark-mode
```

### Coding Standards

#### JavaScript
- Use ES6+ features (const, let, arrow functions, template literals)
- Use meaningful variable and function names
- Add JSDoc comments for functions and complex logic
- Maximum line length: 100 characters

#### Example:
```javascript
/**
 * Creates a new chat message bubble in the DOM
 * @param {string} content - The message text content
 * @param {boolean} isUser - Whether the message is from the user
 * @returns {HTMLElement} The created message element
 */
function createChatBubble(content, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user' : 'assistant'}`;
    bubble.textContent = content;
    return bubble;
}
```

#### CSS
- Use meaningful class names (BEM naming recommended)
- Group related styles together
- Use CSS custom properties for theme colors
- Avoid inline styles except for dynamic values

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(widget): add voice input toggle button

Adds a toggle button to enable/disable voice input in the chat widget.
Includes visual feedback when voice recognition is active.

Closes #123
```

```
fix(call-dependency): preserve reason field after CRM form reset

Implemented mutation observer to detect and restore Call Reason field
after the CRM form auto-clears it on certain operations.

Fixes #89
```

---

## Pull Request Process

### Before Submitting

1. **Run Tests**
   - Ensure all existing tests pass
   - Add tests for new functionality
   - Test manually in browser

2. **Update Documentation**
   - Update relevant docs for new features
   - Add comments in code for complex logic
   - Update CHANGELOG.md if applicable

3. **Check Code Quality**
   - Run linting if configured
   - Ensure no console.log statements in production code
   - Verify all resources load correctly

### Pull Request Template

```markdown
## Description
[Description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Testing

## Testing
[How was this tested?]

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process
1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

---

## Testing Guidelines

### Manual Testing
- Test in Chrome and Edge browsers
- Test on CRM pages with various form states
- Verify voice input works (if applicable)
- Test conversation persistence after page reload

### Test File Organization
```
tests/
├── unit/           # Unit tests for isolated functions
├── integration/    # Integration tests for API calls
├── *.html          # Manual test pages
└── README.md       # Testing documentation
```

### Writing Tests
- Test one thing per test case
- Use descriptive test names
- Include setup and teardown
- Mock external dependencies

---

## Documentation

### Updating Documentation

When adding or modifying features:
1. Update `README.md` if it affects installation or basic usage
2. Update `docs/PROJECT_DOCUMENTATION.md` for significant changes
3. Add inline comments for complex code
4. Update API documentation in `docs/api/` if applicable

### Documentation Style
- Use clear, concise language
- Include code examples where appropriate
- Add screenshots for UI changes
- Keep documentation up-to-date with code

---

## Questions?

If you have questions or need help:
- Open an issue for bugs or feature requests
- Check existing documentation in `docs/`
- Contact the development team

---

**Thank you for contributing!**
