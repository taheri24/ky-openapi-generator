@echo off
REM Ky OpenAPI Generator - NPM Publish Script for Windows
REM This script automates the process of publishing to npm

setlocal enabledelayedexpansion

set VERSION_TYPE=%1
if "%VERSION_TYPE%"=="" set VERSION_TYPE=patch

set DRY_RUN=%2
if "%DRY_RUN%"=="" set DRY_RUN=false

echo.
echo ================================
echo Ky OpenAPI Generator - NPM Publish Script
echo ================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: npm is not installed. Please install Node.js and npm first.
  exit /b 1
)

REM Check git status
echo Checking git status...
git status -s | findstr .
if %ERRORLEVEL% EQU 0 (
  echo Error: Repository has uncommitted changes. Please commit all changes first.
  exit /b 1
)
echo ✓ Git status clean
echo.

REM Check npm login
echo Checking npm authentication...
npm whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Not logged in to npm. Run 'npm login' first.
  exit /b 1
)
for /f %%i in ('npm whoami') do set CURRENT_USER=%%i
echo ✓ Logged in as: %CURRENT_USER%
echo.

REM Clean and build
echo Cleaning and building...
if exist dist rmdir /s /q dist
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Error: Build failed
  exit /b 1
)
echo ✓ Build completed
echo.

REM Get current version
for /f %%i in ('node -p "require('./package.json').version"') do set CURRENT_VERSION=%%i
echo Current version: %CURRENT_VERSION%
echo.

REM Version bump
echo Updating version (%VERSION_TYPE%)...
call npm version %VERSION_TYPE% --no-git-tag-version
for /f %%i in ('node -p "require('./package.json').version"') do set NEW_VERSION=%%i
echo ✓ Version updated: %CURRENT_VERSION% → %NEW_VERSION%
echo.

if "%DRY_RUN%"=="true" (
  echo ================================
  echo DRY RUN MODE
  echo ================================
  echo Would publish version: %NEW_VERSION%
  echo Rolling back version change...
  call npm version %CURRENT_VERSION% --no-git-tag-version
  echo ✓ Dry run completed successfully
  exit /b 0
)

REM Commit version bump
echo Committing version update...
git add package.json package-lock.json
git commit -m "chore: bump version to %NEW_VERSION%"
git push origin main
echo ✓ Version commit pushed
echo.

REM Publish to npm
echo Publishing to npm...
call npm publish --access public
if %ERRORLEVEL% NEQ 0 (
  echo Error: npm publish failed
  exit /b 1
)
echo ✓ Published to npm successfully!
echo.

REM Verify publication
echo Verifying publication...
timeout /t 2 /nobreak
for /f %%i in ('npm view ky-openapi-generator version') do set NPM_VERSION=%%i
if "%NPM_VERSION%"=="%NEW_VERSION%" (
  echo ✓ Verified: npm package version is %NPM_VERSION%
) else (
  echo Error: Verification failed. Expected %NEW_VERSION%, got %NPM_VERSION%
  exit /b 1
)
echo.

REM Create git tag
echo Creating git tag...
git tag "v%NEW_VERSION%"
git push origin "v%NEW_VERSION%"
echo ✓ Git tag created and pushed
echo.

echo ================================
echo ✓ Publishing Complete!
echo ================================
echo Package: ky-openapi-generator
echo Version: %NEW_VERSION%
echo npm URL: https://www.npmjs.com/package/ky-openapi-generator
echo.

endlocal
