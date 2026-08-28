'use client';

import Button from '@/components/basics/Button';
import Section from '@/components/basics/Section';

type ErrorProps = { error: Error & { digest?: string }; reset: () => void };

// Uses plain type-role classes instead of Title/Content so html-react-parser doesn't end up in
// every route's client bundle.
const Error = ({ error, reset }: ErrorProps) => {
	return (
		<main>
			<Section colorset="dark">
				<h1 className="title is-1">Er ging iets mis</h1>
				<p className="content">
					Probeer het opnieuw. Blijft het misgaan, neem dan contact met ons op.
				</p>
				<Button onClick={reset} value="Probeer opnieuw" />
				{error.digest && <p className="content is-small">Foutcode: {error.digest}</p>}
			</Section>
		</main>
	);
};

export default Error;
