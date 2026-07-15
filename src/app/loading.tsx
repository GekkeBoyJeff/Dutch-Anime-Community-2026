import { Section, Content } from '@/components/basics';

// Shown immediately while a (future dynamic) segment loads — Next streams it via Suspense.
const Loading = () => {
	return (
		<main>
			<Section colorset="light">
				<Content value="Laden…" />
			</Section>
		</main>
	);
};

export default Loading;
