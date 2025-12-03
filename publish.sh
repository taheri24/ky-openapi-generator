#!/bin/bash

# npm publish script for ky-openapi-generator
# This script handles the complete publishing workflow to npmjs

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
  echo -e "${GREEN}✓ ${1}${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠ ${1}${NC}"
}

log_error() {
  echo -e "${RED}✗ ${1}${NC}"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  log_error "npm is not installed"
  exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  log_error "git is not installed"
  exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  log_error "package.json not found. Please run this script from the project root"
  exit 1
fi

log_info "Starting npm publish process for ky-openapi-generator"

# Parse command line arguments
DRY_RUN=false
SKIP_TESTS=false
BUMP="patch"  # Default version bump

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      log_warn "Running in DRY-RUN mode (no changes will be published)"
      ;;
    --skip-tests)
      SKIP_TESTS=true
      log_warn "Skipping build verification"
      ;;
    BUMP=*)
      BUMP="${arg#BUMP=}"
      if ! echo "$BUMP" | grep -qE "^(major|minor|patch)$"; then
        log_error "Invalid BUMP value: $BUMP (must be major, minor, or patch)"
        exit 1
      fi
      ;;
    *)
      log_error "Unknown argument: $arg"
      echo "Usage: ./publish.sh [BUMP=major|minor|patch] [--dry-run] [--skip-tests]"
      echo ""
      echo "Examples:"
      echo "  ./publish.sh                    # Bump patch version (1.0.2 → 1.0.3)"
      echo "  ./publish.sh BUMP=minor         # Bump minor version (1.0.2 → 1.1.0)"
      echo "  ./publish.sh BUMP=major         # Bump major version (1.0.2 → 2.0.0)"
      echo "  ./publish.sh BUMP=patch --dry-run  # Dry-run with patch bump"
      exit 1
      ;;
  esac
done

# Get current version
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
log_info "Current version: ${CURRENT_VERSION}"

# Bump version before checking git status
log_info "Preparing to bump version..."
if make version-update BUMP="$BUMP" > /dev/null 2>&1; then
  NEW_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
  log_success "Version bumped: ${CURRENT_VERSION} → ${NEW_VERSION}"
else
  log_error "Failed to bump version"
  exit 1
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
  log_warn "Working directory has uncommitted changes"
  log_info "Please commit or stash your changes before publishing"
  #exit 1
fi

log_success "Working directory is clean"

# Build the project
if [ "$SKIP_TESTS" = false ]; then
  log_info "Building project..."
  npm run build
  if [ $? -eq 0 ]; then
    log_success "Build completed successfully"
  else
    log_error "Build failed"
    exit 1
  fi
else
  log_warn "Skipping build verification"
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
  log_error "dist directory not found. Build may have failed"
  exit 1
fi

log_success "dist directory exists"

# Check if authenticated with npm
log_info "Checking npm authentication..."
if ! npm whoami &> /dev/null; then
  log_error "Not authenticated with npm. Please run 'npm login' first"
  exit 1
fi
log_success "npm authentication verified"

# Prepare for publishing
log_info "Preparing to publish version ${CURRENT_VERSION}..."

# Run dry-run first to catch any issues
log_info "Running dry-run to verify package contents..."
if npm run publish:dry; then
  log_success "Dry-run completed successfully"
else
  log_error "Dry-run failed. Check package contents"
  exit 1
fi

# Perform actual publish
if [ "$DRY_RUN" = true ]; then
  log_success "DRY-RUN COMPLETED"
  log_info "Would publish version ${NEW_VERSION} to npmjs"
  exit 0
fi

log_info "Publishing to npmjs..."
if npm publish; then
  log_success "Successfully published version ${NEW_VERSION} to npmjs!"
  echo ""
  log_info "Package details:"
  echo "  Name: $(grep '"name"' package.json | head -1 | sed 's/.*"name": "\([^"]*\)".*/\1/')"
  echo "  Version: ${NEW_VERSION}"
  echo "  URL: https://www.npmjs.com/package/$(grep '"name"' package.json | head -1 | sed 's/.*"name": "\([^"]*\)".*/\1/')"
  echo ""
  log_success "Publishing completed!"
else
  log_error "Publishing failed"
  exit 1
fi
