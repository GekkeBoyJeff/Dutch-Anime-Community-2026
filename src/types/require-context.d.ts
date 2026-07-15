// webpack/Turbopack's require.context — used by src/lib/puck/presets.ts to enumerate the content
// block stories at build time. Only the members that file needs are declared.
declare namespace NodeJS {
	interface Require {
		context(
			directory: string,
			useSubdirectories?: boolean,
			regExp?: RegExp,
		): {
			keys(): string[];
			(id: string): unknown;
		};
	}
}
