// ── The breakpoint scale ──
// Six widths, in one place, because two languages need the same numbers and neither can read the
// other:
//
//   SCSS  `breakpoint(m)` and `bp(m)` in _tokens.scss — used by 36 component stylesheets.
//   TS    `compileSizes()` in src/lib/site/images/index.ts, which writes the `sizes` attribute on
//         <img srcset>. That tells the browser which image variant to download at which width; if
//         it disagrees with the CSS, the browser fetches the wrong one and nothing reports it.
//
// Sass cannot read JavaScript, so styles.config.mjs writes _breakpoints.scss from this object on
// every dev start and build. Change a value here — never edit the generated file.
export const breakpoints = {
	s: '24rem',
	m: '48rem',
	l: '64rem',
	xl: '80rem',
	'2xl': '90rem',
	'3xl': '120rem',
};
