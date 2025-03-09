import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path, { join } from 'path';

interface IEnvVars {
	[x: string]: any;
}

export default ({ mode }) => {
	console.log('MODE', mode);

	const minify = mode === 'development' ? false : 'terser';
	const sourcemaps = mode === 'development' ? true : false;

	const ENV_VARS: IEnvVars = {
		DEBUG: mode === 'development' ? true : false,
		...process.env,
		...loadEnv(mode, process.cwd()),
	};

	let _mode = ENV_VARS.NODE_ENV === 'storybook' ? 'storybook' : mode;
	console.log('MODE', _mode);

	const currentPath = path.resolve(__dirname);
	const _currentPath =
		_mode === 'storybook'
			? path.resolve('../', __dirname)
			: path.resolve(__dirname);

            console.log("DIRNAME",__dirname);

	
	const config = {
		mode: _mode,
		root: './src',
        
       // base: '/dist', 
	
		build: {
			minify: minify,
			publicDir: '../public/',
			outDir: '../dist/',
			sourcemap: sourcemaps,
			reportCompressedSize: true,
			//minify: true,
			//minify: 'terser',
			//reportCompressedSize: true,
			copyPublicDir: true,
			rollupOptions: {
				//external: ['react', 'react-router-dom', 'react-router'],
				output: {
					globals: {
						react: 'React'
					}
				},
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/styles'],
                    'vendor-admin': ['react-admin','dash-admin', 'dash-admin-state', 'dash-auto-admin'],
                    'vendor-utils': ['lodash', 'moment', 'axios'],
                    'vendor-framer': ['framer-motion'],
                }
			}			
		},
		/*preview: {
            port: 8080
        },*/
		devServer: {
			open: './',
			port: ENV_VARS.VITE_DEV_PORT,
			host: ENV_VARS.VITE_DEV_HOST || '0.0.0.0',
			strictPort: true,
			hmr: {
				port: ENV_VARS.VITE_HMR_PORT,
				clientPort: ENV_VARS.VITE_HMR_PORT,
				host: ENV_VARS.VITE_HMR_HOST,
				path: '/hmr/',
			},
		
		},
		server: {
		open: './',
			port: ENV_VARS.VITE_DEV_PORT,
			host: ENV_VARS.VITE_DEV_HOST || '0.0.0.0',
			strictPort: true,
			hmr: {
				port: ENV_VARS.VITE_HMR_PORT,
				clientPort: ENV_VARS.VITE_HMR_PORT,
				host: ENV_VARS.VITE_HMR_HOST,
				path: '/hmr/',
			},
		},
		define: {
			'process.env': ENV_VARS,
		},
		resolve: {
			alias: {
             	'@app': path.resolve(currentPath, './src'),
                '@packages': path.resolve(currentPath, '../../packages'),
			},
		},
		plugins: [
            react(),
		],
		/*optimizeDeps:{
            esbuildOptions:{
                plugins:[
                esbuildCommonjs(['react-beautiful-dnd'])
                ]
            }
        },*/
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
					additionalData: `
                    @import "../../../packages/dash-styles/src/dash-variables.less";
                    @import '@app/dash-variables.less';
                    `,
				},
			},
			devSourcemap: sourcemaps,
		},
	};
	console.log(config);
	/* @ts-ignore */
	return defineConfig(config);
};