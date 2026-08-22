import type { Ref } from 'react';

import Section from '@/components/basics/Section';
import MarqueeTicker from '@/components/components/MarqueeTicker';
import type { ProofTickerProps } from '@/lib/content';

// A strip of short facts, meant to sit right under a claim so the claim and its evidence are in one
// block. Server Component — the ticker is pure CSS and pauses under prefers-reduced-motion.
const ProofTicker = ({
	items,
	direction,
	variant,
	label = 'Over de community',
	colorset,
	ref,
}: ProofTickerProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="proof-ticker">
			<MarqueeTicker items={items} direction={direction} variant={variant} aria-label={label} />
		</Section>
	);
};

export default ProofTicker;
