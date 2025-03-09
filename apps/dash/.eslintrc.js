/* eslint-disable no-undef */
module.exports = {
	root: true,
	extends: ['dash-eslint'],
    parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ['./tsconfig.eslint.json'],
		tsconfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true
        }
	},
    ignorePatterns: ["**/*.wip"],
	rules: {
		// TODO: turn on errors for missing imports with alias. settings are not working, further revision required
		"import/no-unresolved": 'off',
        "jsdoc/no-types": "off",
		"react/jsx-uses-react": "off",
		"react/react-in-jsx-scope": "off",
		"react/jsx-no-useless-fragment": ["warn", { "allowExpressions":  true }],
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},     
		react: {
			version: 'detect',
		},
		
		'import/internal-regex': '^@',
		'import/resolver': { 
			node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.ttf'] },
			'eslint-import-resolver-custom-alias': {
				'alias': {
					'@app': './src',
				},
				'extensions': ['.ts', '.tsx'],
			},
			'alias': {
				map: [
					[ '@app', './src' ],
				],
			},
			'typescript': {
				'alwaysTryTypes': true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

				'project': './',
			},
		
		},
	},
};