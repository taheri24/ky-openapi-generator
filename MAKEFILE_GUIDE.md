# Makefile Guide - ky-openapi-generator

This project includes a comprehensive Makefile to streamline development workflows and common operations.

## Quick Start

```bash
# Display all available commands
make help

# Build the project
make build

# Run tests
make test

# Generate a client from OpenAPI spec
make gen SPEC=openapi.json

# Publish to npm
make publish
```

## Build Commands

### `make build`
Builds TypeScript source files to JavaScript in the `dist/` directory.

```bash
make build
```

### `make dev`
Starts TypeScript compiler in watch mode. Automatically recompiles files when they change.

```bash
make dev
```

### `make clean`
Removes the `dist/` directory and all compiled files.

```bash
make clean
```

## Testing Commands

### `make test`
Runs all tests once using Jest. Executes both `operationIdSuggester.test.ts` and `parser.test.ts`.

```bash
make test
```

Output: 76 tests passing

### `make test-watch`
Runs tests in watch mode. Re-runs tests when source files change.

```bash
make test-watch
```

### `make test-coverage`
Runs tests with coverage report, showing how much code is covered by tests.

```bash
make test-coverage
```

## Generation Commands

### `make gen SPEC=<file>`
Generates a TypeScript HTTP client from an OpenAPI specification file.

**Features:**
- Automatically uses `bun` if available for faster execution
- Falls back to Node.js if `bun` is not installed
- Supports all OpenAPI 3.0+ features

```bash
# Generate from spec
make gen SPEC=openapi.json

# Generate with output file
make gen SPEC=openapi.json --output src/client.ts

# Generate with custom base URL
make gen SPEC=openapi.json --baseUrl https://api.example.com

# Generate with custom client name
make gen SPEC=openapi.json -c MyApiClient

# Generate with checksum verification
make gen SPEC=openapi.json --checksum sha256 --output client.ts
```

### `make gen-node SPEC=<file>`
Generates a client using Node.js explicitly (bypasses `bun`).

```bash
make gen-node SPEC=openapi.json
```

### `make gen-example`
Generates the example client from `example/petstore.openapi.json`.

```bash
make gen-example
```

Output is written to `example/generated/`.

## CLI Commands (with Bun Support)

### `make check-bun`
Checks if `bun` is installed on the system.

```bash
make check-bun
```

**Output:**
```
✓ bun is installed
```

or

```
⚠ bun not found. Install from https://bun.sh
```

### `make cli ARGS="<arguments>"`
Runs the CLI directly with custom arguments using `bun` (or Node.js as fallback).

```bash
# Show help
make cli ARGS="--help"

# Show version
make cli ARGS="--version"

# Generate client
make cli ARGS="spec.json --output client.ts"

# Generate with options
make cli ARGS="openapi.json -b https://api.example.com -c ApiClient"
```

### `make cli-help`
Displays the CLI help message.

```bash
make cli-help
```

### `make cli-version`
Shows the CLI version.

```bash
make cli-version
```

## Publishing Commands

### `make publish-check`
Verifies package configuration before publishing (version, name, entry points).

```bash
make publish-check
```

**Output:**
```
Package Version: 1.0.2
Package Name: ky-openapi-generator
Main Entry: dist/index.js
Bin Command: ky-openapi-gen
```

### `make publish-dry`
Performs a dry-run of the publish process without uploading to npm.

```bash
make publish-dry
```

This is useful for testing before actual publication.

### `make publish`
Publishes the package to npm after confirmation.

```bash
make publish
```

**Important:**
- Requires npm authentication (`npm login`)
- Prompts for confirmation before publishing
- Builds the project automatically
- Shows the package URL after successful publication

```
⚠ WARNING: This will publish to npm registry

Are you sure you want to publish? (y/n) y
Building and publishing...
✓ Published successfully

Package URL:
https://www.npmjs.com/package/ky-openapi-generator
```

## Utility Commands

### `make install`
Installs project dependencies from `package.json`.

```bash
make install
```

### `make status`
Shows project status including git status, version, dependencies, and Node.js info.

```bash
make status
```

**Output:**
```
Project Status:

Git Status:
A  Makefile

Version: 1.0.2

Dependencies:
ky-openapi-generator@1.0.2
├── @types/jest@30.0.0
├── jest@30.2.0
├── ky@1.14.0
└── ts-jest@29.4.6

Node Version: v22.21.1
npm Version: 10.9.4
```

### `make lint`
Runs code linter (currently not configured).

```bash
make lint
```

### `make format`
Formats code (currently not configured).

```bash
make format
```

## Workflow Commands

### `make setup`
Complete project setup: installs dependencies, builds, generates example, and runs tests.

```bash
make setup
```

Equivalent to: `make install build gen-example test`

### `make rebuild`
Clean build: removes dist and rebuilds.

```bash
make rebuild
```

Equivalent to: `make clean build`

### `make all`
Builds, tests, and generates example in one command.

```bash
make all
```

Equivalent to: `make build test gen-example`

### `make watch`
Starts development watch mode (alias for `make dev`).

```bash
make watch
```

## Advanced Examples

### Complete Development Workflow

```bash
# Initial setup
make setup

# Start development with watch mode
make watch

# In another terminal, run tests in watch mode
make test-watch

# Generate client from spec
make gen SPEC=my-api.json --output src/client.ts

# After making changes, build and test
make build && make test
```

### Preparation for Publishing

```bash
# Check everything is ready
make status

# Run all tests
make test

# Generate example to verify generation works
make gen-example

# Do a dry-run publish
make publish-dry

# If dry-run succeeds, publish for real
make publish
```

### Generate Multiple Clients

```bash
# Generate from different specs
make gen SPEC=api-v1.json --output src/client-v1.ts
make gen SPEC=api-v2.json --output src/client-v2.ts
make gen SPEC=api-v3.json --output src/client-v3.ts
```

### Using with Different Environments

```bash
# Development environment
make gen SPEC=openapi.json --baseUrl http://localhost:3000

# Staging environment
make gen SPEC=openapi.json --baseUrl https://staging-api.example.com

# Production environment
make gen SPEC=openapi.json --baseUrl https://api.example.com
```

## Troubleshooting

### Bun Not Found
If `make cli ARGS="..."` fails with "bun not found", it will automatically fall back to Node.js. To install bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Permission Denied
If you get "Permission denied" errors on some make commands:

```bash
# Make sure the Makefile is readable
chmod 644 Makefile
```

### npm Authentication Issues
Before publishing, ensure you're logged in:

```bash
npm login
npm whoami
```

### Tests Failing
If tests fail, check:

```bash
# Verify all dependencies are installed
make install

# Clean rebuild
make rebuild

# Run tests with verbose output
npm test -- --verbose
```

## Color Output

The Makefile uses color-coded output for better visibility:

- **Blue** (`[0;34m`) - Section headers and main messages
- **Green** (`[0;32m`) - Success messages and checkmarks
- **Yellow** (`[0;33m`) - Warnings and important notices
- **Red** (`[0;31m`) - Error messages

## Environment Variables

The Makefile respects the following environment variables:

- `SPEC` - Path to OpenAPI specification file
- `ARGS` - Arguments to pass to the CLI

## Prerequisites

- **Node.js** v16+ (Required)
- **npm** v7+ (Required)
- **bun** (Optional, recommended for better performance)
- **make** (Required)

## Further Reading

See `CLAUDE.md` for:
- Project structure
- Development workflow details
- Publishing guidelines
- Common issues and solutions
