# Contributing to OpenWork

Thanks for your interest in contributing! 🎉

## Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/openwork.git`
3. Create a feature branch: `git checkout -b feat/my-feature`
4. Make your changes
5. Run tests: `node test/test.js`
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push and create a Pull Request

## Development Setup
```bash
# No dependencies to install — zero-dependency project!
node bin/openwork.js --help    # Verify CLI works
node test/test.js              # Run test suite
```

## Code Standards
- **Zero external dependencies** — only Node.js built-in modules
- ESM imports (`import`/`export`)
- Use the `ui` module for all terminal output (ANSI colors, tables)
- All new features must include tests in `test/test.js`

## Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `chore:` — Maintenance tasks
- `ci:` — CI/CD changes

## Reporting Issues
- Use GitHub Issues with a clear title and description
- Include your OS, Node.js version, and steps to reproduce
