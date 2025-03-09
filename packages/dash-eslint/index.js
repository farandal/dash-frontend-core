// eslint-disable-next-line no-undef
module.exports = {
	globals: {
		React: true,
		google: true,
		context: true,
		expect: true,
		jsdom: true,
		JSX: true,
	},
	extends: [
		'./jsdoc.js',
		'./typescript.cjs',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'prettier',
		'plugin:jsx-a11y/recommended',
		'airbnb-typescript',
		'eslint:recommended',
		//'turbo',
	],
	plugins: [
		'react',
		'html',
		'json',
		'prettier',
		'import',
		'jsx-a11y',
		'@typescript-eslint',
	],

	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2020,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	overrides: [
		{
			files: ['*.tsx'],
			rules: {
				"react/react-in-jsx-scope": "off",
                "jsdoc/no-types": "off",
				"react/jsx-uses-react": 'off',
				"react/jsx-no-useless-fragment": ["warn", { "allowExpressions":  true }],
				'jsdoc/require-jsdoc': 'off',
				'jsdoc/require-param': 'off',
				'no-undef': 'off',
				'@typescript-eslint/naming-convention': [
					'off',
					{
						selector: ['enumMember', 'interface'],
						format: ['PascalCase'],
					},
					{
						selector: ['variable', 'function', 'classMethod'],
						leadingUnderscore: 'allow',
						trailingUnderscore: 'allow',
						format: ['camelCase'],
					},
				],
			},
		},
	],
	rules: {
		'react/prop-types': 'off',
		'react/display-name': 'off',

		'import/no-extraneous-dependencies': [
			'error',
			{
				//devDependencies: ['**/*.stories.*', '**/.storybook/**/*.*'],
				devDependencies: true,
				peerDependencies: true,
				optionalDependencies: true,
				bundledDependencies: true,
			},
		],
		// https://stackoverflow.com/questions/56337176/prettier-and-eslint-indents-not-working-together
		'@typescript-eslint/indent': ['error', 'tab'],
		quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
		'@next/next/no-img-element': 'off',

		/*'no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: 'React',
				//"varsIgnorePattern": "^(?:React|child)$"
			},
		],*/

		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				ignoreRestSiblings: true,
				argsIgnorePattern: '^_',
				varsIgnorePattern: 'React',
			},
		],
		'no-explicit-any': 'off',
		'no-unused-vars': [
			'error',
			{
				ignoreRestSiblings: true,
				argsIgnorePattern: '^_',
				varsIgnorePattern: 'React',
			},
		],

		//semi:  ['error', 'always', { 'omitLastInOneLineClassBody': true }],
		eqeqeq: ['error', 'always'],
		'no-console': 'off',
		'import/no-unresolved': [2, { commonjs: true, amd: true }],
		'import/named': 0,
		'import/namespace': 2,
		'import/default': 2,
		'import/export': 2,
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
				'': 'never',
			},
		],
	},
};
