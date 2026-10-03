// Flat config (D30). There is deliberately no svelte.config.js — all Svelte
// config lives in vite.config.ts — so svelteConfig is passed inline here with
// the one option that matters to the parser: runes mode is forced.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	{ ignores: ['build/', '.svelte-kit/', 'node_modules/', '.lighthouseci/', 'schemas/'] },
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig: { compilerOptions: { runes: true } }
			}
		}
	},
	{
		rules: {
			// No paths.base is configured and every href is a literal prerendered
			// route; the prerender crawler already hard-fails the build on broken
			// links, which is the check this rule approximates.
			'svelte/no-navigation-without-resolve': 'off',
			// Every {#each} renders static JSON at prerender time and never
			// reorders, so keys buy nothing here.
			'svelte/require-each-key': 'off',
			// {' '} is the deliberate whitespace idiom (Prettier emits it too).
			'svelte/no-useless-mustaches': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	}
);
