#!/bin/bash

# Ky OpenAPI Generator - NPM Publish Script
# This script automates the process of publishing to npm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "\n${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

print_info() {
  echo -e "${YELLOW}→ $1${NC}"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install Node.js and npm first."
fi

# Parse command line arguments
VERSION_TYPE="${1:-patch}"
DRY_RUN="${2:-false}"

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
  print_error "Invalid version type. Use: patch, minor, or major"
fi

print_header "Ky OpenAPI Generator - NPM Publish Script"

# Step 1: Check git status
print_info "Checking git status..."
if [[ -n $(git status -s) ]]; then
  print_error "Repository has uncommitted changes. Please commit all changes first."
fi
print_success "Git status clean"

# Step 2: Check if logged in to npm
print_info "Checking npm authentication..."
if ! npm whoami > /dev/null 2>&1; then
  print_error "Not logged in to npm. Run 'npm login' first."
fi
CURRENT_USER=$(npm whoami)
print_success "Logged in as: $CURRENT_USER"

# Step 3: Clean and build
print_info "Cleaning and building..."
rm -rf dist/
npm run build
print_success "Build completed"

# Step 4: Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Step 5: Version bump
print_info "Updating version ($VERSION_TYPE)..."
npm version $VERSION_TYPE --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version updated: $CURRENT_VERSION → $NEW_VERSION"

if [[ "$DRY_RUN" == "true" ]]; then
  print_header "DRY RUN MODE"
  print_info "Would publish version: $NEW_VERSION"
  print_info "Rolling back version change..."
  npm version $CURRENT_VERSION --no-git-tag-version
  print_success "Dry run completed successfully"
  exit 0
fi

# Step 6: Commit version bump
print_info "Committing version update..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"
git push origin $(git branch --show-current)
print_success "Version commit pushed"

# Step 7: Publish to npm
print_info "Publishing to npm..."
npm publish --access public
print_success "Published to npm successfully!"

# Step 8: Verify publication
print_info "Verifying publication..."
sleep 2
NPM_VERSION=$(npm view ky-openapi-generator version)
if [[ "$NPM_VERSION" == "$NEW_VERSION" ]]; then
  print_success "Verified: npm package version is $NPM_VERSION"
else
  print_error "Verification failed. Expected $NEW_VERSION, got $NPM_VERSION"
fi

# Step 9: Create git tag
print_info "Creating git tag..."
git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"
print_success "Git tag created and pushed"

print_header "✓ Publishing Complete!"
echo -e "Package: ${GREEN}ky-openapi-generator${NC}"
echo -e "Version: ${GREEN}$NEW_VERSION${NC}"
echo -e "npm URL: ${GREEN}https://www.npmjs.com/package/ky-openapi-generator${NC}\n"
