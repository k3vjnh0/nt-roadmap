# Contributing to Safe Map

Thank you for your interest in contributing to Safe Map! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/nt-roadmap.git
   cd nt-roadmap
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-repo/nt-roadmap.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   ./setup.sh
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the application
npm run dev

# Run tests (when available)
npm test

# Check TypeScript types
npm run build
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add route history feature"
```

**Commit message format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(map): add incident clustering
fix(api): correct safety score calculation
docs(readme): update installation instructions
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Submit for review

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use meaningful variable names

**Example:**
```typescript
// Good
interface UserLocation {
  latitude: number;
  longitude: number;
}

function getDistance(point1: UserLocation, point2: UserLocation): number {
  // implementation
}

// Avoid
function getDistance(p1: any, p2: any) {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into hooks
- Use TypeScript for props

**Example:**
```tsx
interface IncidentMarkerProps {
  incident: Incident;
  onClick: (id: string) => void;
}

export function IncidentMarker({ incident, onClick }: IncidentMarkerProps) {
  return (
    // component JSX
  );
}
```

### File Organization

```
src/
├── components/       # React components
├── services/        # API and business logic
├── store/           # State management
├── types/           # TypeScript types
├── utils/           # Helper functions
└── hooks/           # Custom React hooks
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use trailing commas in objects/arrays
- Maximum line length: 100 characters

**ESLint will enforce these rules automatically**

### Comments

```typescript
// Good: Explain WHY, not WHAT
// Calculate distance using Haversine formula for accuracy on curved earth surface
const distance = calculateDistance(point1, point2);

// Avoid: Stating the obvious
// Set the user location
setUserLocation(location);
```

## Areas for Contribution

### High Priority

- [ ] OpenStreetMap integration as fallback
- [ ] Weather API integration
- [ ] React Native mobile app
- [ ] Unit and integration tests
- [ ] Accessibility improvements
- [ ] Performance optimizations

### Features

- [ ] Route history
- [ ] Favorite locations
- [ ] Push notifications
- [ ] Offline mode
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Social sharing
- [ ] Analytics dashboard

### Documentation

- [ ] API examples
- [ ] Architecture diagrams
- [ ] Video tutorials
- [ ] Translation of docs

### Bug Fixes

Check the [Issues](https://github.com/your-repo/issues) page for bugs to fix.

## Testing Guidelines

### Manual Testing

Before submitting:
1. Test on multiple browsers (Chrome, Firefox, Safari)
2. Test responsive design (mobile, tablet, desktop)
3. Test with different incident data
4. Verify error handling
5. Check console for errors

### Automated Testing (Future)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Submitting Changes

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass (when implemented)
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] PR description explains changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Reporting Issues

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 119]
- Version: [e.g. 1.0.0]

**Additional context**
Any other information
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
Clear description

**Describe the solution**
What you want to happen

**Describe alternatives**
Alternative solutions considered

**Additional context**
Any other information
```

## Review Process

1. **Automated checks** run on PR
2. **Code review** by maintainers
3. **Feedback** provided for improvements
4. **Approval** when ready
5. **Merge** into main branch

### Review Criteria

- Code quality and readability
- Follows project conventions
- Adequate testing
- Documentation updated
- No breaking changes (unless discussed)

## Communication

- **GitHub Issues** - Bug reports and features
- **Pull Requests** - Code changes
- **Discussions** - General questions

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion
- Reach out to maintainers

Thank you for contributing to Safe Map! 🎉
