module.exports = {
	singleQuote: true,
	tabWidth: 2,
	useTabs: true,
	semi: true,
	overrides: [
		{
			files: ['**/*.scss', '**/*.css'],
			options: {
				singleQuote: false,
			},
		},
	],
	quoteProps: 'as-needed',
	jsxSingleQuote: true,
	trailingComma: 'all',
	bracketSpacing: true,
	arrowParens: 'always',
	endOfLine: 'lf',
};
