import next from 'eslint-config-next/core-web-vitals';

// v16 ships a native flat config — spread it directly, no FlatCompat (that's what crashes on ESLint 9).
const config = [
	...next,
	{
		rules: {
			// House style: every function is an arrow function assigned to a const — components included.
			'react/function-component-definition': [
				'error',
				{ namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
			],
			// Disallow `function` declarations everywhere else too (helpers, exports); arrow consts only.
			'func-style': ['error', 'expression', { allowArrowFunctions: true }],
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
		},
	},
	{ ignores: ['.next/**', 'storybook-static/**'] },
];

export default config;