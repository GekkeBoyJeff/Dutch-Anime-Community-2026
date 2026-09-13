// Writes every generated file on its own, so `npm run verify` — which starts neither a dev server
// nor a build — cannot typecheck a stale one.
import { generateBlocks } from './generate-blocks.mjs';

// Imported for its side effect: it writes _breakpoints.scss and theme.generated.ts.
import '../styles.config.mjs';

generateBlocks();
