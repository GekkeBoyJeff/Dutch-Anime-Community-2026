'use client';

// Catches errors thrown by the ROOT layout/template itself (the next/font call, metadataBase, the
// global SCSS import, the layout's JSON-LD) — the one place app/error.tsx can't reach, because that
// boundary renders *inside* the layout. global-error replaces the entire document, so it must ship its
// own <html>/<body> and cannot rely on the site's SCSS/colorsets having loaded. Styles are inline and
// the colours are literals on purpose: this file must stay self-contained in case the failure is in a
// module the rest of the app shares.
interface GlobalErrorProps {
	/** The caught error; `digest` correlates the production error screen to a server log line */
	error?: Error & { digest?: string };
	/** Re-renders the root segment */
	reset?: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
	return (
		<html lang="nl">
			<body
				style={{
					margin: 0,
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'system-ui, sans-serif',
					backgroundColor: '#14110f',
					color: '#f9f9f9',
				}}
			>
				<main style={{ maxWidth: '32rem', padding: '2rem', textAlign: 'center' }}>
					<h1 style={{ fontSize: '2rem', lineHeight: 1.1, marginBottom: '1rem' }}>Er ging iets mis</h1>
					<p style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
						Er trad een onverwachte fout op. Probeer de pagina opnieuw te laden.
					</p>
					<button
						type="button"
						onClick={() => reset?.()}
						style={{
							font: 'inherit',
							padding: '0.5rem 1.25rem',
							border: 0,
							borderRadius: '0.5rem',
							backgroundColor: '#2f6df6',
							color: '#ffffff',
							cursor: 'pointer',
						}}
					>
						Probeer opnieuw
					</button>
					{error?.digest && (
						<p style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.6 }}>Foutcode: {error.digest}</p>
					)}
				</main>
			</body>
		</html>
	);
};

export default GlobalError;
