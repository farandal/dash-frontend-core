# Building Electron App for Debian AMD64 on Windows

This guide walks through building and packaging the KitchenTabs Electron application for Debian AMD64 architecture on Windows using WSL2.

## Prerequisites

- Windows 10/11 with WSL2 enabled
- Ubuntu 20.04+ distribution installed in WSL2
- Node.js v20.19.0+ (in WSL)
- npm v9.6.7+ (in WSL)

### Check WSL Distributions

```powershell
wsl --list --verbose
```

If Ubuntu isn't installed:

```powershell
wsl --install -d Ubuntu
```

## Step 1: Start WSL and Navigate to Project

```powershell
wsl -d Ubuntu
cd /mnt/c/KITCHNTABS/kitchntabs-frontend
```

## Step 2: Install Build Dependencies

The build requires `fpm` (Effecting Package Manager) and other tools to create `.deb` packages on a Linux system.

### Update Package Manager

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Install Required Tools

```bash
# Install build tools and fpm
sudo apt-get install -y \
  build-essential \
  ruby-dev \
  fpm \
  python3 \
  git

# Verify fpm installation
fpm --version
```

### Install pnpm

```bash
sudo npm install -g pnpm@9.15.0
pnpm --version
```

## Step 3: Install Node Dependencies

```bash
# From the project root
pnpm install
```

## Step 4: Build Python Services (if needed)

If building for the first time or after Python service updates, build the services for AMD64:

```bash
# Navigate to Python service directory
cd ../dash-python-service

# Build Docker image for x64
npm run build:docker:x64

# This will create binaries for:
# - kt_service
# - print_service  
# - tts_service

# Return to frontend directory
cd ../kitchntabs-frontend
```

**Note:** This step requires Docker. If Docker isn't available, skip this step and the build will attempt to use existing binaries.

## Step 5: Build Release for Debian AMD64

The build process is split into configuration, vite build, turbo build, and electron-builder packaging.

### Option A: Production Release (with S3 publishing)

```bash
pnpm release:electron:kitchntabs-app:debian:amd64
```

**Requirements:**
- AWS credentials configured with profile `kitchntabs`
- S3 bucket `kitchntabs-releases` accessible in `us-east-2` region

### Option B: Production Release (without publishing)

```bash
# Configure for production
pnpm config:electron:kitchntabs-app:production

# Build turbo dependencies
turbo build --filter=kitchntabs-app --no-cache

# Build Python services setup
node build-python-service.js

# Build icons
electron-icon-builder --input=./assets/logo-squared.png --output=./

# Build with Vite
vite build -c electron.vite.config.mts

# Package with electron-builder (without publishing)
cross-env NODE_OPTIONS=--max-old-space-size=8096 node build-electron.js \
  --config electron-builder.config.js \
  --linux deb --x64
```

### Option C: Development Release

```bash
pnpm release:electron:kitchntabs-app:debian:amd64:development
```

## Step 6: Locate Output

Once the build completes successfully, the `.deb` package will be in:

```
release/kitchntabs-1.3.15-amd64.deb
```

Copy it back to Windows:

```powershell
# From Windows PowerShell
Copy-Item -Path "\\wsl$\Ubuntu\mnt\c\KITCHNTABS\kitchntabs-frontend\release\kitchntabs-*.deb" -Destination "C:\KITCHNTABS\releases\"
```

## Build Process Explanation

### 1. Configuration (`pnpm config:electron:kitchntabs-app:production`)
- Sets `MODE=production`, `CUSTOM_MODE=kitchntabs.production`
- Generates environment-specific configuration files

### 2. Turbo Build (`turbo build --filter=kitchntabs-app`)
- Builds all workspace dependencies
- Compiles TypeScript, bundles CSS, etc.

### 3. Python Services (`node build-python-service.js`)
- Prepares Python service binaries
- Copies architecture-specific binaries to the release directory

### 4. Icon Generation (`electron-icon-builder`)
- Creates platform-specific app icons from source image

### 5. Vite Build (`vite build -c electron.vite.config.mts`)
- Bundles Electron main process
- Bundles Electron preload script
- Creates `dist-electron/` with all bundled code

### 6. Electron Builder (`electron-builder`)
- Packages bundled app into `.deb` format
- Creates Linux desktop entry
- Generates installer metadata
- Creates symlinks for terminal access

## Troubleshooting

### Issue: "fpm: command not found"

**Solution:** Ensure fpm is installed:
```bash
sudo apt-get install -y ruby-dev
sudo gem install fpm
```

### Issue: "Python service binaries not found"

**Solution:** Build Python services for x64:
```bash
cd ../dash-python-service
npm run build:docker:x64
cd ../kitchntabs-frontend
```

If Docker isn't available, the build will proceed with a warning but may fail during packaging.

### Issue: "Cannot find module './apps/kitchntabs/package.json'"

**Solution:** This is already fixed in the updated `electron-builder.config.js`. Ensure you're using the latest version that references `apps/kitchntabs-app` instead of `apps/kitchntabs`.

### Issue: "ENOENT: spawn fpm ENOENT" on Windows (PowerShell)

**Solution:** This indicates you're trying to build on Windows directly. Use WSL2 instead:
```powershell
wsl -d Ubuntu -e bash -c "cd /mnt/c/KITCHNTABS/kitchntabs-frontend && pnpm release:electron:kitchntabs-app:debian:amd64"
```

### Issue: AWS Credentials Not Found

If using the production command with `--publish always`:
```bash
# Configure AWS credentials in WSL
aws configure --profile kitchntabs
# Or set environment variables:
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-2
```

Or skip publishing:
```bash
cross-env NODE_OPTIONS=--max-old-space-size=8096 node build-electron.js \
  --config electron-builder.config.js \
  --linux deb --x64
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODE` | development | Build mode (development/production) |
| `CUSTOM_MODE` | kitchntabs.development | Configuration mode |
| `TARGET_TYPE` | desktop | Target type (desktop/mobile/web) |
| `PLATFORM` | electron | Platform (electron/web/android/ios) |
| `APP_PATH` | apps/kitchntabs-app | Application directory |
| `NODE_OPTIONS` | --max-old-space-size=8096 | Node memory limit (increase for large builds) |
| `AWS_PROFILE` | kitchntabs | AWS profile for S3 publishing |
| `USE_BUSTER_BINARIES` | false | Use Debian Buster-compatible binaries for older systems |

## Configuration Files

Key configuration files for the build:

- **electron-builder.config.js** — Main Electron build configuration
  - Defines targets (deb, AppImage, etc.)
  - Specifies files to include/exclude
  - Configures Python service integration
  
- **electron.vite.config.mts** — Vite bundling configuration
  - Bundles main process, preload, and renderer
  - Handles dev server vs. production build
  
- **build_config.js** — Generates environment-specific configs
  - Creates `electron-config.yaml` with API endpoints
  - Generates `.env` files for the app
  
- **build-python-service.js** — Manages Python service setup
  - Handles architecture-specific binary selection
  - Sets up Buster compatibility if needed

## Next Steps

After successful build:

1. **Test the package**
   ```bash
   # Install on a Linux system
   sudo dpkg -i release/kitchntabs-1.3.15-amd64.deb
   ```

2. **Verify installation**
   ```bash
   kitchntabs --version
   # or
   /opt/kitchntabs/kitchntabs --version
   ```

3. **Publish to S3** (if credentials configured)
   ```bash
   pnpm release:electron:kitchntabs-app:debian:amd64
   ```

## Performance Tips

- Use `--max-old-space-size=8096` for Node memory (8GB)
- Increase to 16384 for very large projects
- Run on fast SSD for quicker builds
- First build will be slower due to dependency resolution
- Subsequent builds are faster if dependencies haven't changed

## Support

For issues:

1. Check the build output for specific error messages
2. Ensure all prerequisites are installed in WSL
3. Verify `apps/kitchntabs-app/` directory exists and has content
4. Check that Python service binaries exist if needed
5. Review the electron-builder config for file paths

See `electron-builder.config.js` for advanced configuration options.
