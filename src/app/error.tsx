'use client';

import Button from '@/components/basics/Button';
import Section from '@/components/basics/Section';

interface ErrorProps {
	/** The caught error; `digest` correlates this screen to a server log line in production */
	error?: Error & { digest?: string };
	/** Retries rendering the segment */
	reset?: () => void;
}

// Route error boundary; must be a Client Component (`reset` re-renders the segment). Uses plain
// type-role classes instead of Title/Content so html-react-parser doesn't end up in every route's
// client bundle.
const Error = ({ error, reset }: ErrorProps) => {
	return (
		<main>
			<Section colorset="dark">
				<h1 className="title is-1">Er ging iets mis</h1>
				<p className="content">
					Probeer het opnieuw. Blijft het misgaan, neem dan contact met ons op.
				</p>
				<Button onClick={reset}>Probeer opnieuw</Button>
				{error?.digest && <p className="content is-small">Foutcode: {error.digest}</p>}
			</Section>
		</main>
	);
};

export default Error;
