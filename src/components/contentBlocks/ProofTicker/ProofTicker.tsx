import Section from '@/components/basics/Section/Section';
import MarqueeTicker from '@/components/components/MarqueeTicker/MarqueeTicker';

import type { ProofTickerProps as ProofTickerSchemaProps } from './ProofTicker.schema';

import './ProofTicker.scss';

type ProofTickerProps = ProofTickerSchemaProps;

const ProofTicker = ({
	items,
	direction,
	variant,
	ariaLabel = 'Over de community',
	colorset,
}: ProofTickerProps) => {
	return (
		<Section colorset={colorset} className="proof-ticker">
			<MarqueeTicker items={items} direction={direction} variant={variant} ariaLabel={ariaLabel} />
		</Section>
	);
};

export default ProofTicker;
