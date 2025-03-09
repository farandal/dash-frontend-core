// eslint-disable-next-line no-undef
module.exports = {
	extends: ['plugin:@typescript-eslint/recommended'],
	rules: {
		
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
		'no-shadow': 'off',
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-property-type': 'off',
		'jsdoc/require-returns-type': 'off',
		'@typescript-eslint/consistent-type-definitions': 'error',
		//'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-shadow': 'error',
		//'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'enumMember',
				format: ['PascalCase'],
			},
			{
				selector: ['variable', 'function', 'classMethod'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
				format: ['camelCase'],
			},
			{
				selector: ['interface'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
				format: ['PascalCase'],
			},
		],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{ 'ts-ignore': 'allow-with-description' },
		],
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/no-throw-literal' : 'off',
		'@typescript-eslint/ban-types': ['error',
			{
				'types': {
					'String': false,
					'Boolean': false,
					'Number': false,
					'Symbol': false,
					'{}': false,
					'Object': false,
					'object': false,
					'Function': false,
				},
				'extendDefaults': true,
			},
		],
	},
};
