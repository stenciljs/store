# Contributing to @stencil/store

Thank you for your interest in contributing to @stencil/store! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project follows the same code of conduct as the main StencilJS project. Please be respectful and inclusive in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/store.git
   cd store
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/stenciljs/store.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 22.14.0
- npm >= 9.x

### Installation

```bash
npm install
```

### Available Scripts

- `npm run build` - Build the project
- `npm test` - Run all tests
- `npm run test.unit` - Run unit tests with Vitest
- `npm run test.prettier` - Check code formatting
- `npm run prettier` - Format code with Prettier

### Project Structure

```
src/
├── index.ts              # Main entry point
├── store.ts              # Core store implementation
├── observable-map.ts     # Observable map utilities
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions
└── subscriptions/
    └── stencil.ts        # Stencil-specific subscriptions
```

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following these guidelines:
   - Write clear, readable code
   - Add tests for new functionality
   - Update documentation if needed
   - Follow the existing code style

3. Run tests to ensure everything works:
   ```bash
   npm test
   ```

4. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add new feature description"
   ```

### Commit Message Guidelines

Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

## Testing

### Unit Tests

The project uses Vitest for unit testing. Tests are located alongside the source files with `.test.ts` extensions.

```bash
npm run test.unit
```

### Test App

There's a test application in the `test-app/` directory that demonstrates the store functionality:

```bash
cd test-app
npm install
npm start
```

### Writing Tests

When adding new features or fixing bugs:

1. Add unit tests in the appropriate `.test.ts` file
2. Test both positive and negative cases
3. Include edge cases
4. Ensure tests are isolated and don't depend on external state

## Pull Request Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Include tests for new functionality
   - Update documentation if needed

3. Ensure all checks pass:
   - All tests must pass
   - Code must be properly formatted
   - No linting errors

4. Address any review feedback

5. Once approved, a maintainer will merge your PR

## Release Process

### Release Types

We follow [Semantic Versioning (SemVer)](https://semver.org/) for releases. Choose the appropriate release type based on your changes:

#### Patch Release (x.x.X)
Use for:
- Bug fixes
- Documentation updates
- Internal refactoring that doesn't change the API
- Performance improvements without API changes

#### Minor Release (x.X.x)
Use for:
- New features that are backward compatible
- New API methods or options
- Deprecating functionality (without removing)
- Significant internal improvements

#### Major Release (X.x.x)
Use for:
- Breaking changes to the public API
- Removing deprecated functionality
- Changes that require users to modify their code
- Major architectural changes

### Development Releases

Development Releases (or "Dev Releases", "Dev Builds") are installable instances of Stencil Store that are:
- Published to the npm registry for distribution within and outside the Stencil team
- Built using the same infrastructure as production releases, with less safety checks
- Used to verify a fix or change to the project prior to a production release

#### How to Publish Dev Releases

Only members of the Stencil team may create dev builds of Stencil Store.
To publish a dev build:
1. Navigate to the [Stencil Store Release GitHub Action](https://github.com/stenciljs/store/actions/workflows/release.yml) in your browser.
2. Click the 'Run Workflow' dropdown on the right hand side of the page
3. Configure the workflow inputs:
   - **Release type**: Select `patch`, `minor`, or `major` (this won't affect the dev build version)
   - **Dev Release**: Select `yes` to create a dev build
4. Select the branch you want to build from
5. Click 'Run Workflow'
6. Allow the workflow to run. Upon completion, the output of the 'Publish Dev Build' action will report the published version string.

Following a successful run of the workflow, the package can be installed from the npm registry like any other package.

#### Dev Release Format

Dev Builds are published to the NPM registry under the `@stencil/store` scope.
Unlike production builds, dev builds use a specially formatted version string to express its origins.
Dev builds follow the format `BASE_VERSION-dev.EPOCH_DATE.SHA`, where:
- `BASE_VERSION` is the latest production release changes to the build were based off of
- `EPOCH_DATE` is the number of seconds since January 1st, 1970 in UTC
- `SHA` is the git short SHA of the commit used in the release

As an example: `2.1.0-dev.1677185104.7c87e34` was built:
- With v2.1.0 as the latest production build at the time of the dev build
- On Fri, 26 Jan 2024 13:48:17 UTC
- With the commit `7c87e34`

### Production Releases

Only members of the Stencil team may create production releases of Stencil Store.

#### How to Publish Production Releases

1. Navigate to the [Stencil Store Release GitHub Action](https://github.com/stenciljs/store/actions/workflows/release.yml) in your browser.
2. Click the 'Run Workflow' dropdown on the right hand side of the page
3. Configure the workflow inputs:
   - **Release type**: Select the appropriate type (`patch`, `minor`, or `major`) based on your changes
   - **Dev Release**: Select `no` for production releases
4. Select the `main` branch (production releases should only be made from main)
5. Click 'Run Workflow'
6. The workflow will:
   - Build and test the package
   - Bump the version according to the selected release type
   - Create a Git tag
   - Publish to NPM with the `latest` tag
   - Create a GitHub release

#### Release Checklist

Before creating a production release:
- [ ] Ensure all intended changes are merged to `main`
- [ ] All CI checks are passing
- [ ] Update any relevant documentation
- [ ] Consider if this should be a dev release first for testing
- [ ] Choose the correct release type (patch/minor/major)
- [ ] Notify the team of the planned release

## Questions or Issues?

- Create an issue on GitHub for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed information including steps to reproduce for bugs

Thank you for contributing to @stencil/store! 🎉 