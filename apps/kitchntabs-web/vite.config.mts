import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import svgr from "vite-plugin-svgr";


import packageJson from "../../package.json" assert { type: "json" };

interface IEnvVars {
  [x: string]: any;
}

interface IBuildConfig {
  mode?: string;
  customMode?: string;
  targetType?: string;
  platform?: string;
  nodeOptions?: string;
  memoryLimit?: number;
  timestamp?: string;
  buildId?: string;
  platformConfig?: {
    buildType?: string;
    outputDir?: string;
    packageFormat?: string;
    minSdkVersion?: number;
    targetSdkVersion?: number;
    minVersion?: string;
  };
  targetConfig?: {
    framework?: string;
    buildCommand?: string;
    syncCommand?: string;
    packageCommand?: string;
    deployCommand?: string;
    features?: string[];
  };
  customModeConfig?: {
    apiBaseUrl?: string;
    environment?: string;
    debugMode?: boolean;
    features?: {
      hotReload?: boolean;
      devTools?: boolean;
      mockData?: boolean;
    };
  };
}

// Function to load build configuration
const loadBuildConfig = (): IBuildConfig => {
  const configPath = path.resolve(process.cwd(), "../../build_config.json");

  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, "utf8");
      const buildConfig = JSON.parse(configContent);
      console.log(
        "ðŸ“‹ Loaded build_config.json:",
        buildConfig.buildId || "unknown"
      );
      return buildConfig;
    }
  } catch (error) {
    console.warn(
      "âš ï¸ Warning: Could not load build_config.json:",
      error.message
    );
  }

  console.log(
    "ðŸ“‹ No build_config.json found, using environment variables only"
  );
  return {};
};

// Function to detect platform based on Capacitor and environment
const detectPlatform = (buildConfig: IBuildConfig) => {
  const targetType =
    buildConfig.targetType || process.env.TARGET_TYPE || "browser";
  const capacitorPlatform =
    buildConfig.platform || process.env.CAPACITOR_PLATFORM;
  const envPlatform = buildConfig.platform || process.env.PLATFORM;

  // Special case: desktop + electron should NOT be capacitor/android/ios
  const isElectronDesktop =
    targetType === "desktop" && envPlatform === "electron";
  if (isElectronDesktop) {
    return {
      isAndroid: false,
      isIOS: false,
      isCapacitorBuild: false,
      androidExists: false,
      iosExists: false,
      targetType,
      platform: envPlatform,
    };
  }

  // For desktop + web builds, we don't want to treat it as a Capacitor build
  const isDesktopWebBuild = targetType === "desktop" && envPlatform === "web";

  // Check if we're in a Capacitor build context
  const isCapacitorBuild =
    targetType === "mobile" ||
    (targetType === "desktop" && !isDesktopWebBuild) ||
    process.env.IS_CAPACITOR === "true";

  // Platform detection logic
  const isAndroid =
    capacitorPlatform === "android" ||
    envPlatform === "android" ||
    process.argv.includes("--platform=android") ||
    process.cwd().includes("android");

  const isIOS =
    capacitorPlatform === "ios" ||
    envPlatform === "ios" ||
    process.argv.includes("--platform=ios") ||
    process.cwd().includes("ios");

  // Check for Capacitor platform files
  const androidExists = fs.existsSync(
    path.resolve(process.cwd(), "../../android")
  );
  const iosExists = fs.existsSync(path.resolve(process.cwd(), "../../ios"));

  // For desktop web builds, we should explicitly set platform flags to false
  const finalIsAndroid = isDesktopWebBuild
    ? false
    : isAndroid || (isCapacitorBuild && androidExists && !isIOS);
  const finalIsIOS = isDesktopWebBuild
    ? false
    : isIOS || (isCapacitorBuild && iosExists && !isAndroid);
  const finalIsCapacitorBuild = isDesktopWebBuild ? false : isCapacitorBuild;

  return {
    isAndroid: finalIsAndroid,
    isIOS: finalIsIOS,
    isCapacitorBuild: finalIsCapacitorBuild,
    androidExists,
    iosExists,
    targetType,
    platform: envPlatform,
  };
};

export default ({ mode }) => {
  console.log("=== VITE BUILD CONFIGURATION ===");

  // Load build configuration
  const buildConfig = loadBuildConfig();

  // Use build config values with fallbacks to environment variables
  const configMode = buildConfig.mode || process.env.MODE || mode;
  const customMode = buildConfig.customMode || process.env.CUSTOM_MODE;
  const targetType =
    buildConfig.targetType || process.env.TARGET_TYPE || "browser";
  const platform = buildConfig.platform || process.env.PLATFORM;

  console.log("MODE:", configMode);
  console.log("CUSTOM_MODE:", customMode || null);
  console.log("TARGET_TYPE:", targetType);
  console.log("PLATFORM:", platform);
  console.log("BUILD_ID:", buildConfig.buildId || "N/A");
  console.log("BUILD_TIMESTAMP:", buildConfig.timestamp || "N/A");

  if (buildConfig.customModeConfig) {
    console.log("DEBUG_MODE:", buildConfig.customModeConfig.debugMode);
  }

  console.log(
    "Process args:",
    process.argv.filter((arg) => arg.includes("platform"))
  );

  const isProduction =
    configMode === "production" ||
    mode.includes("production") ||
    process.env.NODE_ENV === "production";

  const isDevelopment = !isProduction;

  console.log("Is Production Build:", isProduction);
  console.log("Is Development Build:", isDevelopment);

  const minify = isDevelopment ? false : "esbuild";
  const sourcemaps = isDevelopment ? true : false;

  //const minify = false;
  //const sourcemaps = true;

  const customEnvExtension = customMode ? "." + customMode : "." + mode;
  const envPath = path.resolve(process.cwd(), `.env${customEnvExtension}`);

  console.log("ENV File Path:", envPath);

  // Load base env vars from the standard Vite mode
  const baseEnvVars = loadEnv(mode, process.cwd());
  
  // Load custom env file if customMode is specified
  let customEnvVars: IEnvVars = {};
  if (customMode && fs.existsSync(envPath)) {
    console.log("ðŸ“‚ Loading custom env file:", envPath);
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;
      const eqIndex = trimmedLine.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmedLine.substring(0, eqIndex).trim();
        let value = trimmedLine.substring(eqIndex + 1).trim();
        // Remove surrounding quotes if present
        if ((value.startsWith("'") && value.endsWith("'")) || 
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        customEnvVars[key] = value;
      }
    }
    console.log("ðŸ“‹ Loaded custom env vars:", Object.keys(customEnvVars));
  } else if (customMode) {
    console.warn("âš ï¸ Custom env file not found:", envPath);
  }
  
  // Merge env vars - custom overrides base
  const envVars = { ...baseEnvVars, ...customEnvVars };

  // Detect platform information
  const platformInfo = detectPlatform(buildConfig);
  console.log("Platform Detection:", platformInfo);

  const isDesktop = targetType === "desktop";
  const isMobile = platformInfo.isAndroid || platformInfo.isIOS;
  const isCapacitorBuild = platformInfo.isCapacitorBuild || isMobile;
  const isElectronBuild = platformInfo.platform === "electron";

  let _mode =
    envVars.NODE_ENV === "storybook"
      ? "storybook"
      : isProduction
        ? "production"
        : "development";
  console.log("Final MODE:", _mode);

  const ENV_VARS: IEnvVars = {
    DEBUG: isDevelopment,

    ...envVars,

    VITE_APP_VERSION: packageJson.version,
    VITE_BUILD_TIME: new Date().toISOString(),
    VITE_BUILD_ID: buildConfig.buildId || "dev-build",
    VITE_BUILD_TIMESTAMP: buildConfig.timestamp || new Date().toISOString(),
    VITE_IS_ELECTRON:
      process.env.IS_ELECTRON === "true" ||
      (targetType === "desktop" && platform === "electron"),
    VITE_PLATFORM: process.platform,
    VITE_IS_WINDOWS: process.platform === "win32",
    VITE_IS_MAC: process.platform === "darwin",
    VITE_IS_LINUX: process.platform === "linux",

    VITE_IS_ANDROID: platformInfo.isAndroid,
    VITE_IS_IOS: platformInfo.isIOS,
    VITE_IS_CAPACITOR: platformInfo.isCapacitorBuild,
    VITE_IS_MOBILE: platformInfo.isAndroid || platformInfo.isIOS,
    VITE_CAPACITOR_PLATFORM: platform || "web",
    VITE_ANDROID_AVAILABLE: platformInfo.androidExists,
    VITE_IOS_AVAILABLE: platformInfo.iosExists,

    VITE_PLATFORM_TYPE: platform || "web",
    VITE_TARGET_TYPE: targetType,
    VITE_CUSTOM_MODE: customMode || null,

    // Build config specific variables
    VITE_MEMORY_LIMIT: buildConfig.memoryLimit || null,
    VITE_BUILD_FRAMEWORK: buildConfig.targetConfig?.framework || null,

    VITE_DEBUG_MODE:
      buildConfig.customModeConfig?.debugMode !== undefined
        ? buildConfig.customModeConfig.debugMode
        : isDevelopment,
    VITE_HOT_RELOAD:
      buildConfig.customModeConfig?.features?.hotReload !== undefined
        ? buildConfig.customModeConfig.features.hotReload
        : isDevelopment,
    VITE_DEV_TOOLS:
      buildConfig.customModeConfig?.features?.devTools !== undefined
        ? buildConfig.customModeConfig.features.devTools
        : isDevelopment,
    VITE_MOCK_DATA: buildConfig.customModeConfig?.features?.mockData || false,

    VITE_APP_STORAGE_TYPE: isElectronBuild ? "electronStore" : "localStorage",
    // Add environment variables from build config if they exist
    ...(buildConfig.customModeConfig?.envVars || {}),

    //...isElectronBuild ? { VITE_DASH_ADMIN_URL_PREFIX : '#/' } : {}
  };
  console.log("ENV Vars:", ENV_VARS);

  const currentPath = path.resolve(__dirname);

  const commonExternals = [
    path.resolve(__dirname, "../../electron/preload/index.ts"),
    path.resolve(__dirname, "../../electron/preload/index.js"),
    path.resolve(__dirname, "../../dist-electron/preload/index.js"),
    "../../electron/preload/index.ts",
    "../../electron/preload/index.js",
    "../../dist-electron/preload/index.js",
    "@capacitor/core",
    "@capacitor/filesystem",
    "@capacitor/push-notifications",
    "@capacitor/device",
    "@capacitor/keyboard",
    "@capacitor/app",
    "@capacitor/camera",
    "capacitor-voice-recorder",
    "capacitor-blob-writer",
    "@capacitor/preferences",
  ];
  // Define external modules based on build type
  // We need to remove all capacitor used in apps/dash, because they are added as external dependencies, from the root app, when building android.
  // And injected through the window.Capacitor object.
  const externalModules = isDesktop
    ? [...commonExternals]
    : isMobile
      ? [...commonExternals]
      : [];

  // Define manual chunks using a function for better control over workspace packages
  // IMPORTANT: Be conservative with chunking to avoid circular dependency issues
  const getManualChunks = () => {
    return (id: string) => {
      // Skip if no id
      if (!id) return undefined;

      // Only handle node_modules - let Rollup handle app code naturally
      if (!id.includes('node_modules')) {
        return undefined;
      }

      // Day.js - small, isolated library
      if (id.includes('node_modules/dayjs')) {
        return 'vendor-dayjs';
      }

      // React core ecosystem - these must stay together
      if (
        id.includes('node_modules/react/') ||
        id.includes('node_modules/react-dom/') ||
        id.includes('node_modules/react-is/') ||
        id.includes('node_modules/scheduler/')
      ) {
        return 'vendor-react';
      }

      // React Router - separate chunk
      if (
        id.includes('node_modules/react-router-dom/') ||
        id.includes('node_modules/react-router/')
      ) {
        return 'vendor-react-router';
      }

      // MUI packages - keep ALL MUI together to avoid circular deps
      // This includes @mui/*, @emotion/*, and related utilities
      /*if (
        id.includes('node_modules/@mui/') ||
        id.includes('node_modules/@emotion/') ||
        id.includes('node_modules/@popperjs/') ||
        id.includes('node_modules/popper.js') ||
        id.includes('node_modules/clsx') ||
        id.includes('node_modules/prop-types')
      ) {
        return 'vendor-mui';
      }*/

      // React Admin - must include all ra-* packages together
      if (
        id.includes('node_modules/react-admin') ||
        id.includes('node_modules/ra-')
      ) {
        return 'vendor-react-admin';
      }

      // Utilities - commonly used standalone libraries
      if (
        id.includes('node_modules/lodash') ||
        id.includes('node_modules/axios') ||
        id.includes('node_modules/query-string') ||
        id.includes('node_modules/qs') ||
        id.includes('node_modules/qrcode.react')
      ) {
        return 'vendor-utils';
      }

      // Heavy visualization/interaction libraries
      if (
        id.includes('node_modules/framer-motion') ||
        id.includes('node_modules/react-beautiful-dnd') ||
        id.includes('node_modules/chart.js') ||
        id.includes('node_modules/react-chartjs')
      ) {
        return 'vendor-heavy';
      }

      // Let Rollup handle everything else automatically
      return undefined;
    };
  };

  // Determine output directory based on build config
  const getOutputDir = () => {
    if (buildConfig.platformConfig?.outputDir) {
      // If build config specifies output dir, use relative path from current location
      return "../dist/";
    }
    return "../dist/";
  };

  const config = {
    mode: _mode,
    root: "./src",
    //base: isProduction ? "./" : "./",
    base: isCapacitorBuild || isElectronBuild ? "./" : "/",
    publicDir: "../public",

    build: {
      commonjsOptions: {
        include: [/query-string/, /node_modules/],
      },
      minify: minify,
      outDir: getOutputDir(),
      sourcemap: sourcemaps,
      reportCompressedSize: true,
      copyPublicDir: true,
      emptyOutDir: true,
      target: "es2020",

      rollupOptions: {
        output: {
          manualChunks: getManualChunks(),
          format: "esm",
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/main-[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];

            if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
              return "fonts/[name]-[hash].[ext]";
            }

            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
              return "images/[name]-[hash].[ext]";
            }

            return "assets/[name]-[hash].[ext]";
          },
        },

        // External dependencies - only for desktop builds
        external: externalModules,

        // CONSERVATIVE: Don't be too aggressive with tree shaking
        treeshake: {
          moduleSideEffects: true,
        },
      },
    },

    server: {
      /*open: false,
      port: ENV_VARS.VITE_DEV_PORT || 3000,
      host: ENV_VARS.VITE_DEV_HOST || "0.0.0.0",
      strictPort: true,
      hmr: {
        port: ENV_VARS.VITE_HMR_PORT || 3001,
        clientPort: ENV_VARS.VITE_HMR_PORT || 3001,
        host: ENV_VARS.VITE_HMR_HOST || "localhost",
        path: "/hmr/",
      },*/

      open: false,
      port: ENV_VARS.VITE_DEV_PORT || 3000,
      host: ENV_VARS.VITE_DEV_HOST || "0.0.0.0",
      strictPort: true,
      hmr: {
        protocol: isDevelopment ? "ws" : "wss",
        port: ENV_VARS.VITE_HMR_PORT || 4431,
        // No clientPort for ngrok (uses default HTTPS port 443)
        clientHost: ENV_VARS.VITE_HMR_HOST || "localhost", // Browser connects to ngrok domain
        path: "/hmr/",
      },

      allowedHosts: [
        "pw-hmr.ngrok.dev",
        "pw-system.ngrok.dev",
        "localhost",
        "localhost:3000",
        "0.0.0.0",
        "web-dev.kitchntabs.com",
        // Add dynamic ngrok host from build config
        ...(buildConfig.customModeConfig?.apiBaseUrl
          ? [new URL(buildConfig.customModeConfig.apiBaseUrl).hostname]
          : []),
      ],
      fs: {
        strict: false,
      },
    },

    define: {
      "process.env": ENV_VARS,
      global: "globalThis",
      // Add this to help with require() issues
      "process.platform": JSON.stringify(process.platform),
      "process.env.NODE_ENV": JSON.stringify(_mode),
    },

    resolve: {
      alias: [
        { find: "@app", replacement: path.resolve(currentPath, "./src") },
        { find: "@dash-styles-src", replacement: path.resolve(currentPath, "../../node_modules/dash-styles/src") },
        // react-beautiful-dnd is unmaintained on React 18/19; map to the @hello-pangea/dnd drop-in.
        { find: "react-beautiful-dnd", replacement: "@hello-pangea/dnd" },
        // kt-* are workspace turbo packages developed in THIS repo: consume their SOURCE
        // (instant HMR; Vite scans their deps). The optional "/src" is stripped so both
        // "kt-x/foo" and "kt-x/src/foo" resolve to packages/kt-x/src/foo.
        ...["kt-cashcount", "kt-ecommerce", "kt-kiosk", "kt-pages", "kt-utils"].map((n) => ({
          find: new RegExp(`^${n}(?:/src)?(/.*)?$`),
          replacement: path.resolve(currentPath, `../../packages/${n}/src$1`),
        })),
        { find: "@packages", replacement: path.resolve(currentPath, "../../packages") },
      ],
      dedupe: ["react", "react-dom", "query-string"],
    },

    plugins: [
      {
        name: "warn-preload-import",
        resolveId(source) {
          if (source.includes("electron/preload/index")) {
            this.warn("âš ï¸  Attempted to import preload script in renderer!");
          }
          return null;
        },
      },
      // Force HMR to use the correct WebSocket URL
      {
        name: "configure-hmr-client",
        transform(code, id) {
          if (id.includes("vite/dist/client/client.mjs")) {
            const hmrHost = ENV_VARS.VITE_HMR_HOST || "localhost";
            const hmrPort = ENV_VARS.VITE_HMR_PORT || 4431;
            
            // Determine if we should include the port:
            // - If host is localhost, 127.0.0.1, or an IP address, include port
            // - If host is a domain name (like ngrok), don't include port (uses 443)
            const isLocalhost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\d+\.\d+\.\d+\.\d+)$/i.test(hmrHost);
            const socketHost = isLocalhost ? `${hmrHost}:${hmrPort}` : hmrHost;
            const socketProtocol = isDevelopment ? "ws" : "wss";
            console.log(`ðŸ”§ Injecting HMR URL: ${socketProtocol}://${socketHost}/hmr/`);
            console.log(`   Host type: ${isLocalhost ? 'localhost/IP (with port)' : 'domain (no port)'}`);
            
            // Override the WebSocket URL construction
            return code.replace(
              /const socketProtocol[^;]+;/,
              `const socketProtocol = '${socketProtocol}';`
            ).replace(
              /const socketHost[^;]+;/,
              `const socketHost = '${socketHost}';`
            );
          }
          return code;
        },
      },
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react",
      }),
      svgr(),

      /*{
        name: 'generate-netlify-redirects',
        closeBundle() {
          const outputDir = path.resolve(__dirname, 'dist');
          const redirectsContent = '/*    /index.html   200';
          fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
          console.log('Generated Netlify _redirects file');
        }
      },*/
      // Add build config info plugin
      {
        name: "build-config-info",
        buildStart() {
          if (buildConfig.buildId) {
            console.log(`ðŸ”§ Building with config: ${buildConfig.buildId}`);
            if (buildConfig.customModeConfig?.apiBaseUrl) {
              console.log(
                `ðŸŒ API Base URL: ${buildConfig.customModeConfig.apiBaseUrl}`
              );
            }


            if (config.server && config.server.hmr) {
            console.log('ðŸ”§ VITE HMR CLIENT CONFIG ðŸ”§');
            console.log('clientHost:', config.server.hmr.clientHost);
            console.log('protocol:', config.server.hmr.protocol);
            console.log('path:', config.server.hmr.path);
            console.log('-----------------------------');
            }
            

          }
        },
        generateBundle() {
          // Inject build info into the bundle
          const buildInfo = {
            buildId: buildConfig.buildId || "dev-build",
            timestamp: buildConfig.timestamp || new Date().toISOString(),
            mode: configMode,
            targetType: targetType,
            platform: platform,
            version: packageJson.version,
          };


           

          this.emitFile({
            type: "asset",
            fileName: "build-info.json",
            source: JSON.stringify(buildInfo, null, 2),
          });
        },
      },
    ],

    optimizeDeps: {
      // INCLUDE: Pre-bundle problematic modules
      // Adding all these upfront prevents "new dependencies optimized, reloading" during dev
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-is",
        "is-mobile",
        "@ant-design/icons",
        "@ant-design/icons-svg",
        "antd",
        "react-color",
        "react-draggable",
        "react-number-format",
        "numeral",
        "file-saver",
        "react-feather",
        "react-spinners",
        "react-chartjs-2",
        "chart.js",
        "react-json-viewer",
        "react-google-recaptcha",
        "react-places-autocomplete",
        "react-drag-drop-files",
        "mui-nested-menu",
        "node-polyglot",
        "jsonexport",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-router-dom",
        "react-router",
        "@mui/material",
        "@mui/system",
        "@mui/icons-material",
        "@mui/utils",
        "@emotion/react",
        "@emotion/styled",
        "query-string", // CRITICAL: Pre-bundle this
        "qs",
        "axios",
        "lodash",
        "dayjs",
        "dayjs/plugin/advancedFormat",
        "dayjs/plugin/customParseFormat",
        "dayjs/plugin/utc",
        "dayjs/plugin/timezone",
        "dayjs/plugin/isBetween",
        "dayjs/plugin/localizedFormat",
        "dayjs/plugin/weekOfYear",
        // Add these to fix the sync external store issue
        "use-sync-external-store",
        "use-sync-external-store/shim",
        "use-sync-external-store/shim/index.js",
        "use-sync-external-store/shim/with-selector",
        // Add React 18 related packages
        "react-redux",
        "@reduxjs/toolkit",
        // Add MUI Data Grid related packages
        "@mui/x-data-grid",
        "@mui/x-date-pickers",
        
        // React Admin and all ra-* packages - pre-bundle to avoid runtime optimization
        "react-admin",
        "ra-core",
        "ra-ui-materialui",
        "ra-data-simple-rest",
        "ra-i18n-polyglot",
        "ra-language-english",
        "ra-language-spanish",
        
        // Other commonly lazy-loaded packages
        "redux",
        "redux-saga",
        "redux-saga/effects",
        "redux-thunk",
        "connected-react-router",
        "history",
        "react-error-boundary",
        "react-hook-form",
        "@hookform/error-message",
        "js-cookie",
        "clsx",
        "prop-types",
        "laravel-echo",
        "pusher-js",
        "@rooks/use-previous",
        "react-custom-scrollbars-2",
        "react-loading-overlay-ts",
        "node-match-path",
        "framer-motion",
        "qrcode.react",

        // Capacitor modules - only include for mobile builds (not external)
        ...(isCapacitorBuild
          ? [
              "@capacitor/core",
              "@capacitor/push-notifications",
              "capacitor-voice-recorder",
            ]
          : []),
      ],

      // EXCLUDE: Let these be handled normally (workspace packages)
      exclude: [
        "dash-admin",
        "dash-auto-admin",
        "dash-admin-state",
        "@tanstack/react-query",
        "colorthief",
        "@nosferatu500/react-sortable-tree",
        "@syncfusion/ej2-react-treegrid",

        // Exclude Capacitor modules for desktop builds only
        //...(isDesktop ? [
        //'@capacitor/core',
        //'
        // ] : [])
      ],
      force: true,

      esbuildOptions: {
        target: "es2020",
        define: {
          global: "globalThis",
          "process.platform": JSON.stringify(process.platform),
          "process.env.NODE_ENV": JSON.stringify(_mode),
        },
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `
            @import "@dash-styles-src/dash-variables.less";
            @import "@dash-styles-src/dash-css-transformer.less";
            @import '@app/dash-variables.less';
          `,
        },
      },
      devSourcemap: sourcemaps,
    },

    esbuild: {
      target: "es2020",
      //drop: isProduction ? ['console', 'debugger'] : [],
      define: {
        global: "globalThis",
        "process.platform": JSON.stringify(process.platform),
        "process.env.NODE_ENV": JSON.stringify(_mode),
      },
    },

    worker: {
      format: "es",
    },
  };

  console.log("=== FINAL CONFIG ===");
  console.log("Mode:", config.mode);
  console.log("Is Mobile Build:", isMobile);
  console.log("Is Desktop Build:", isDesktop);
  console.log("Is Capacitor Build:", isCapacitorBuild);
  console.log("External Modules:", externalModules);
  console.log("Manual Chunks:", [
    'vendor-dayjs',
    'vendor-react',
    'vendor-mui',
    'vendor-react-admin',
    'vendor-dash',
    'vendor-utils',
    'vendor-heavy',
    'dash-notifications',
    'dash-communications',
    'dash-theme'
  ]);
  console.log("Platform Info:", platformInfo);
  console.log("Build Config Loaded:", !!buildConfig.buildId);
  console.log("Output Directory:", getOutputDir());

  if (buildConfig.targetConfig) {
    console.log("Target Framework:", buildConfig.targetConfig.framework);
    console.log("Target Features:", buildConfig.targetConfig.features);
  }

  console.log("====================");

  return defineConfig(config);
};
