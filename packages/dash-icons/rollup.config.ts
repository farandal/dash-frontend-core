import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

import packageJson from './package.json';

export default [
	{
		input: 'src/index.ts',
		external: [/^react[.]*/],
		output: [
			{
				file: packageJson.name,
				format: 'esm', // cjs
				sourcemap: true,
			},
		],
	},
	{
		input: './src/index.ts',

		output: [{ file: './dash-icons/index.d.ts', format: 'esm' }],
		plugins: [resolve(), dts()],
	},
];
