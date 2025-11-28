# CLAUDE.md - Development Guide for ky-openapi-generator

This document provides guidance for Claude (and other AI assistants) working on the ky-openapi-generator project.

## Project Overview

**ky-openapi-generator** is a TypeScript-based code generator that creates typed HTTP clients from OpenAPI specifications using the [ky.js](https://github.com/sindresorhus/ky) HTTP client library.

### Key Features
- Generates TypeScript HTTP clients from OpenAPI 3.0+ specs
- Type-safe API methods and request/response types
- Built-in support for ky.js HTTP client
- CLI tool for easy integration into build pipelines
- Full TypeScript support with declaration files

## Project Structure

```
ky-openapi-generator/
├── src/                          # Source TypeScript files
│   ├── index.ts                 # Main library exports
│   ├── cli.ts                   # CLI entry point
│   ├── generator.ts             # Core code generation logic
│   └── ...                      # Other generator modules
├── dist/                        # Compiled JavaScript (generated)
├── example/                     # Example OpenAPI specs and generated code
│   └── petstore.openapi.json   # Sample OpenAPI specification
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── publish.sh                  # npm publish automation script
├── README.md                   # User documentation
└── CLAUDE.md                   # This file
```

## Key Files and Purposes

| File | Purpose |
|------|---------|
| `package.json` | npm configuration, scripts, and dependencies |
| `src/index.ts` | Main library exports for programmatic usage |
| `src/cli.ts` | Command-line interface implementation |
| `src/generator.ts` | Core OpenAPI-to-TypeScript generation logic |
| `tsconfig.json` | TypeScript compiler options |
| `publish.sh` | Automated npm publishing workflow |
| `example/petstore.openapi.json` | Test OpenAPI specification |

## Build and Development

### Prerequisites
- Node.js 16+ and npm
- TypeScript 5.3+

### Available Scripts

```bash
# Build the project
npm run build

# Watch mode (recompile on changes)
npm run dev

# Generate example client
npm run gen:example

# Generate example and build in one command
npm run gen:example:build

# Test publish (dry-run)
npm run publish:dry

# Publish to npmjs
npm run publish
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Compile** with `npm run build` or use watch mode `npm run dev`
3. **Test** changes:
   ```bash
   npm run gen:example
   ```
4. **Verify** generated output looks correct in `example/generated/`
5. **Commit** changes with descriptive messages

## Publishing to npmjs

### Before Publishing

1. **Update version** in `package.json` following [semantic versioning](https://semver.org/)
   - MAJOR.MINOR.PATCH (e.g., 1.0.1, 1.1.0, 2.0.0)
2. **Update README.md** if user-facing features changed
3. **Test the build** locally: `npm run build`
4. **Commit changes** to git

### Publishing Steps

**Option 1: Using the publish script (recommended)**
```bash
./publish.sh
```

**Option 2: Using npm directly**
```bash
npm login        # One-time authentication
npm publish      # Publish to npmjs
```

**Dry-run before publishing**
```bash
npm run publish:dry
```

The `publish.sh` script handles:
- Git status validation
- Build verification
- npm authentication check
- Dry-run testing
- Colored output and progress reporting
- Publishing confirmation with package URL

## Code Generation Implementation

### Core Generator Flow

The generator typically:
1. Parses OpenAPI specification (JSON/YAML)
2. Extracts endpoints, operations, and schemas
3. Generates TypeScript types for schemas
4. Creates HTTP client methods using ky
5. Outputs to `dist/` directory

### Common Changes

**Adding generator features:**
- Modify `src/generator.ts` for core generation logic
- Update CLI arguments in `src/cli.ts` if needed
- Test with `npm run gen:example`

**Updating dependencies:**
- Edit `package.json` dependencies section
- Run `npm install` to update lock file
- Commit both `package.json` and `package-lock.json`

## Version Management

- Current version: Check `package.json` "version" field
- When incrementing version, update in `package.json` only (not in code)
- Follow semantic versioning rules

## Testing and Quality

### Building
```bash
npm run build
```
Compiles TypeScript to JavaScript with proper type checking.

### Validating Generated Code
```bash
npm run gen:example
```
Generates a client from the example OpenAPI spec. Review the output in `example/generated/` to verify correctness.

### Pre-publish Checklist
- [ ] All source files compile without errors
- [ ] Example generation works correctly
- [ ] Package version incremented
- [ ] Changes documented in README.md if user-facing
- [ ] All changes committed to git
- [ ] npm authentication verified (`npm login`)

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| TypeScript compilation errors | Run `npm run build` to see full error output |
| Example generation fails | Verify `example/petstore.openapi.json` is valid OpenAPI 3.0 |
| npm publish fails | Run `npm login` and verify `~/.npmrc` exists |
| Permission denied on publish.sh | Run `chmod +x publish.sh` |
| Changes don't appear in compiled output | Delete `dist/` folder and rebuild |

## Environment Notes

- **Node.js requirement**: v16 or higher
- **Package manager**: npm (preferred over yarn for this project)
- **TypeScript version**: 5.3.3
- **Main export**: `dist/index.js`
- **CLI export**: `dist/cli.js`
- **CLI command**: `ky-openapi-gen` (when installed globally)

## Contributing Guidelines for Claude

1. **Always read files before modifying** - Understand existing code structure
2. **Run builds before committing** - Ensure no compilation errors
3. **Make focused commits** - One feature or fix per commit
4. **Update documentation** - Keep README.md and this file in sync
5. **Test generated output** - Run `npm run gen:example` after generator changes
6. **Follow existing code style** - Match the style of surrounding code
7. **Use meaningful commit messages** - Start with verb (feat:, fix:, docs:, etc.)

## Useful Commands Reference

```bash
# Clean and rebuild
rm -rf dist && npm run build

# Check what would be published
npm run publish:dry

# Test the CLI locally
node dist/cli.js example/petstore.openapi.json --output example/generated

# View what's in the package
npm pack

# Update dependencies
npm update
```

## More Information

- **README.md** - User-facing documentation and usage examples
- **package.json** - Dependencies, version, and all npm scripts
- **TypeScript Configuration** - See `tsconfig.json` for compiler settings

---

Last updated: 2025-11-28
