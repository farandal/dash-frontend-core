#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { env } = require('process');

/**
 * Build Configuration Generator
 * Parses environment variables and creates build_config.json
 */

function loadEnvFile(customMode, appPath = null) {
    const envFiles = [
        `.env.${customMode}`,
        //`.env.local`,
        //`.env`
    ];

    const envVars = {};
    
    // Use provided appPath or fall back to APP_PATH env var or default
    const resolvedAppPath = appPath || process.env.APP_PATH || 'apps/dash';
    
    for (const envFile of envFiles) {
        const envPath = path.resolve(process.cwd(), resolvedAppPath, envFile);
        
        if (fs.existsSync(envPath)) {
            console.log(`📄 Loading env file: ${envFile}`);
            const envContent = fs.readFileSync(envPath, 'utf8');
            
            // Parse .env file
            envContent.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const [key, ...valueParts] = trimmedLine.split('=');
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                        envVars[key] = value;
                    }
                }
            });
        }
    }
    
    return envVars;
}

function parseEnvironmentVariables() {
    const config = {
        mode: process.env.MODE || 'development',
        customMode: process.env.CUSTOM_MODE || null,
        targetType: process.env.TARGET_TYPE || 'desktop',
        platform: process.env.PLATFORM || null,
        appPath: process.env.APP_PATH || 'apps/dash',
        nodeOptions: process.env.NODE_OPTIONS || null,
        timestamp: new Date().toISOString(),
        buildId: generateBuildId()
    };

    // Parse NODE_OPTIONS for memory settings
    if (config.nodeOptions) {
        const memoryMatch = config.nodeOptions.match(/--max-old-space-size=(\d+)/);
        if (memoryMatch) {
            config.memoryLimit = parseInt(memoryMatch[1]);
        }
    }

    // Load environment variables from .env files using appPath
    const envVars = loadEnvFile(config.customMode, config.appPath);

    // Add platform-specific configurations
    if (config.platform) {
        config.platformConfig = getPlatformConfig(config.platform);
    }

    // Add target-specific configurations
    config.targetConfig = getTargetConfig(config.targetType);

    // Add custom mode configurations with actual env values
    if (config.customMode) {
        config.customModeConfig = getCustomModeConfig(config.customMode, envVars);
    }

    return config;
}

function getPlatformConfig(platform) {
    const platformConfigs = {
        android: {
            buildType: 'mobile',
            outputDir: 'android/app/build/outputs',
            packageFormat: 'aab',
            minSdkVersion: 22,
            targetSdkVersion: 34
        },
        ios: {
            buildType: 'mobile',
            outputDir: 'ios/App/build',
            packageFormat: 'ipa',
            minVersion: '13.0'
        },
        web: {
            buildType: 'web',
            outputDir: 'build',
            packageFormat: 'static'
        },
        electron: {
            buildType: 'electron',
            outputDir: 'build',
            packageFormat: 'static'
        },
    };

    return platformConfigs[platform] || null;
}

function getTargetConfig(targetType) {
    const targetConfigs = {
        mobile: {
            framework: 'capacitor',
            buildCommand: 'npm run build',
            syncCommand: 'npx cap sync',
            features: ['push-notifications', 'native-apis', 'offline-support']
        },
        desktop: {
            framework: 'electron',
            buildCommand: 'npm run build',
            packageCommand: 'npm run electron:build',
            features: ['file-system', 'native-menus', 'auto-updater']
        },
        web: {
            framework: 'react',
            buildCommand: 'npm run build',
            deployCommand: 'npm run deploy',
            features: ['pwa', 'service-worker', 'web-apis']
        }
    };

    return targetConfigs[targetType] || targetConfigs.desktop;
}

function getCustomModeConfig(customMode, envVars) {
    // Extract API URLs from environment variables
    const apiBaseUrl = envVars.VITE_APP_BACKEND_URL || 
                      envVars.VITE_APP_ADMIN_API_URL?.replace('/api', '') ||
                      getDefaultApiUrl(customMode);
    
    const socketsHost = envVars.VITE_APP_SOCKETS_HOST;
    const socketsScheme = envVars.VITE_APP_SOCKETS_SCHEME || 'https';
    const socketsPort = envVars.VITE_APP_SOCKETS_PORT || '6001';
    
    const customModeConfigs = {
        'pinoywok.ngrok': {
            apiBaseUrl: apiBaseUrl,
            socketsUrl: socketsHost ? `${socketsScheme}://${socketsHost}:${socketsPort}` : null,
            environment: 'development',
            debugMode: true,
            features: {
                hotReload: true,
                devTools: true,
                mockData: false
            }
        },
        'staging': {
            apiBaseUrl: apiBaseUrl,
            socketsUrl: socketsHost ? `${socketsScheme}://${socketsHost}:${socketsPort}` : null,
            environment: 'staging',
            debugMode: true,
            features: {
                hotReload: false,
                devTools: true,
                mockData: false
            }
        },
        'production': {
            apiBaseUrl: apiBaseUrl,
            socketsUrl: socketsHost ? `${socketsScheme}://${socketsHost}:${socketsPort}` : null,
            environment: 'production',
            debugMode: false,
            features: {
                hotReload: false,
                devTools: false,
                mockData: false
            }
        }
    };

    const config = customModeConfigs[customMode] || {
        apiBaseUrl: apiBaseUrl,
        environment: 'development',
        debugMode: true,
        features: {
            hotReload: true,
            devTools: true,
            mockData: false
        }
    };

    // Add all relevant env vars to the config
    config.envVars = {
        VITE_APP_BACKEND_URL: envVars.VITE_APP_BACKEND_URL,
        VITE_APP_ADMIN_API_URL: envVars.VITE_APP_ADMIN_API_URL,
        VITE_APP_SOCKETS_HOST: envVars.VITE_APP_SOCKETS_HOST,
        VITE_APP_SOCKETS_PORT: envVars.VITE_APP_SOCKETS_PORT,
        VITE_APP_SOCKETS_SCHEME: envVars.VITE_APP_SOCKETS_SCHEME,
        VITE_APP_SOCKETS_KEY: envVars.VITE_APP_SOCKETS_KEY,
        VITE_APP_FRONTEND_URL: envVars.VITE_APP_FRONTEND_URL,
        VITE_DEV_PORT: process.env.VITE_DEV_PORT || envVars.VITE_DEV_PORT,
        VITE_HMR_PORT: process.env.VITE_HMR_PORT || envVars.VITE_HMR_PORT,
        VITE_HMR_HOST: envVars.VITE_HMR_HOST
    };

    return config;
}

function getDefaultApiUrl(customMode) {
    const defaults = {
        'pinoywok.ngrok': 'https://pw-api.ngrok.dev',
        'staging': 'https://staging-api.kitchntabs.com',
        'production': 'https://api.kitchntabs.com'
    };
    
    return defaults[customMode] || 'http://localhost:8000';
}

function generateBuildId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `build-${timestamp}-${random}`;
}

function validateConfig(config) {
    const errors = [];

    if (!config.mode) {
        errors.push('MODE is required');
    }

    if (!['development', 'staging', 'production'].includes(config.mode)) {
        errors.push('MODE must be one of: development, staging, production');
    }

    if (!['mobile', 'desktop', 'web'].includes(config.targetType)) {
        errors.push('TARGET_TYPE must be one of: mobile, desktop, web');
    }

    // Allow electron as a valid platform
    if (config.platform && !['android', 'ios', 'web', 'electron'].includes(config.platform)) {
        errors.push('PLATFORM must be one of: android, ios, web, electron');
    }

    if (config.targetType === 'mobile' && !config.platform) {
        errors.push('PLATFORM is required when TARGET_TYPE is mobile');
    }

    return errors;
}

function writeBuildConfig(config) {
    const configPath = path.join(process.cwd(), 'build_config.json');
    
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        console.log('✅ Build configuration created successfully!');
        console.log(`📁 Config file: ${configPath}`);
        return true;
    } catch (error) {
        console.error('❌ Error writing build configuration:', error.message);
        return false;
    }
}

function displayConfig(config) {
    console.log('\n📋 Build Configuration:');
    console.log('========================');
    console.log(`Mode: ${config.mode}`);
    console.log(`Target Type: ${config.targetType}`);
    console.log(`Platform: ${config.platform || 'N/A'}`);
    console.log(`Custom Mode: ${config.customMode || 'N/A'}`);
    console.log(`App Path: ${config.appPath}`);
    console.log(`Memory Limit: ${config.memoryLimit ? config.memoryLimit + 'MB' : 'Default'}`);
    console.log(`Build ID: ${config.buildId}`);
    console.log(`Timestamp: ${config.timestamp}`);
    
    if (config.customModeConfig) {
        console.log(`API Base URL: ${config.customModeConfig.apiBaseUrl}`);
        console.log(`Sockets URL: ${config.customModeConfig.socketsUrl || 'N/A'}`);
        console.log(`Debug Mode: ${config.customModeConfig.debugMode}`);
        
        if (config.customModeConfig.envVars) {
            console.log('\n🔧 Environment Variables:');
            Object.entries(config.customModeConfig.envVars).forEach(([key, value]) => {
                if (value) console.log(`  ${key}: ${value}`);
            });
        }
    }
    
    console.log('========================\n');
}

function main() {
    console.log('🔧 Generating build configuration...\n');

    // Parse environment variables
    const config = parseEnvironmentVariables();

    // Validate configuration
    const errors = validateConfig(config);
    if (errors.length > 0) {
        console.error('❌ Configuration errors:');
        errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
    }

    // Display configuration
    displayConfig(config);

    // Write configuration file
    const success = writeBuildConfig(config);
    
    if (success) {
        console.log('🚀 Ready to build with the generated configuration!');
        
        // Suggest next steps based on target type
        console.log('\n💡 Suggested next steps:');
        if (config.targetType === 'mobile' && config.platform === 'android') {
            console.log('   1. npm run build');
            console.log('   2. npx cap sync android');
            console.log('   3. npx cap open android');
        } else if (config.targetType === 'desktop') {
            console.log('   1. npm run build');
            console.log('   2. npm run electron:build');
        } else if (config.targetType === 'web') {
            console.log('   1. npm run build');
            console.log('   2. npm run deploy');
        }
    } else {
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Build Configuration Generator

Usage:
  MODE=production CUSTOM_MODE=pinoywok.ngrok TARGET_TYPE=mobile PLATFORM=android APP_PATH=apps/kitchntabs node build_config.js

Environment Variables:
  MODE              Build mode (development|staging|production)
  CUSTOM_MODE       Custom configuration mode
  TARGET_TYPE       Target platform type (mobile|desktop|web)
  PLATFORM          Specific platform (android|ios|web|electron)
  APP_PATH          Path to the app directory (e.g., apps/kitchntabs)
  NODE_OPTIONS      Node.js options (e.g., --max-old-space-size=4048)

Examples:
  MODE=production TARGET_TYPE=mobile PLATFORM=android APP_PATH=apps/kitchntabs node build_config.js
  MODE=development CUSTOM_MODE=kitchntabs.development TARGET_TYPE=desktop APP_PATH=apps/kitchntabs node build_config.js
  MODE=staging TARGET_TYPE=web APP_PATH=apps/dash node build_config.js
`);
    process.exit(0);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    parseEnvironmentVariables,
    getPlatformConfig,
    getTargetConfig,
    getCustomModeConfig,
    validateConfig,
    writeBuildConfig,
    loadEnvFile
};
