# Publishing Scripts

This directory contains automated scripts for publishing `ky-openapi-generator` to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.org](https://www.npmjs.com/)
2. **npm Login**: Run `npm login` to authenticate with npm
3. **Git**: All changes must be committed and pushed

## Usage

### Option 1: Using npm scripts (Recommended)

```bash
# Publish a patch release (1.0.0 → 1.0.1)
npm run publish:patch

# Publish a minor release (1.0.0 → 1.1.0)
npm run publish:minor

# Publish a major release (1.0.0 → 2.0.0)
npm run publish:major

# Dry run (test without publishing)
npm run publish:dry
```

### Option 2: Direct script execution

**On macOS/Linux:**

```bash
# Patch release
bash scripts/publish.sh patch

# Minor release
bash scripts/publish.sh minor

# Major release
bash scripts/publish.sh major

# Dry run
bash scripts/publish.sh patch true
```

**On Windows:**

```cmd
REM Patch release
scripts\publish.bat patch

REM Minor release
scripts\publish.bat minor

REM Major release
scripts\publish.bat major

REM Dry run
scripts\publish.bat patch true
```

## What the Script Does

1. **Validates Prerequisites**
   - Checks git status (no uncommitted changes)
   - Verifies npm login status

2. **Builds & Tests**
   - Cleans the dist directory
   - Compiles TypeScript with `npm run build`

3. **Version Management**
   - Bumps version in package.json (patch, minor, or major)
   - Creates a git commit with the version change
   - Pushes the commit to the remote branch

4. **Publishes to npm**
   - Publishes the package with `--access public`
   - Verifies the publish was successful

5. **Creates Release Tag**
   - Creates a git tag (e.g., `v1.0.1`)
   - Pushes the tag to the remote repository

## Dry Run Mode

Test the entire process without actually publishing:

```bash
npm run publish:dry
```

This will:
- Build the project
- Show what version would be published
- Rollback the version change
- Exit without publishing to npm

## Manual Publishing (Advanced)

If you prefer to publish manually:

```bash
# 1. Build the project
npm run build

# 2. Bump version
npm version patch    # or minor/major
npm version minor
npm version major

# 3. Publish to npm
npm publish --access public

# 4. Create git tag
git tag v1.0.1
git push origin v1.0.1
```

## Troubleshooting

### "Not logged in to npm"

```bash
npm login
```

Then run the publish script again.

### "Repository has uncommitted changes"

Commit and push your changes first:

```bash
git add .
git commit -m "Your message"
git push origin $(git branch --show-current)
```

Then run the publish script again.

### "Build failed"

Check for TypeScript errors:

```bash
npm run build
```

Fix the errors and try again.

### "npm publish failed"

Check your npm account permissions:

```bash
npm whoami
npm view ky-openapi-generator
```

Make sure you're the package owner or have publishing rights.

## Version Numbering

The project uses [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.**0**): Bug fixes and small improvements
  - Use when: Fixing bugs or minor improvements
  - Example: 1.0.0 → 1.0.1

- **Minor** (1.**0**.0): New features, backward compatible
  - Use when: Adding new functionality
  - Example: 1.0.0 → 1.1.0

- **Major** (**1**.0.0): Breaking changes
  - Use when: API changes, major refactors
  - Example: 1.0.0 → 2.0.0

## Files in This Directory

- **publish.sh** - Main publishing script for macOS/Linux
- **publish.bat** - Publishing script for Windows
- **README.md** - This file

## Post-Publish

After publishing, users can install the new version:

```bash
npm install ky-openapi-generator@latest
```

Or globally:

```bash
npm install -g ky-openapi-generator@latest
```

## Checking Publication Status

```bash
# View package info
npm view ky-openapi-generator

# View all versions
npm view ky-openapi-generator versions

# View specific version
npm view ky-openapi-generator@1.0.1
```

Visit on npm: https://www.npmjs.com/package/ky-openapi-generator

## Support

For issues or questions:
- Check the main [README.md](../README.md)
- Visit the [GitHub repository](https://github.com/taheri24/ky-openapi-generator)
- Open an issue on GitHub
