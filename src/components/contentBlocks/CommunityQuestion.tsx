'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import RadioGroup from '@/components/forms/RadioGroup';
import type { CommunityQuestionProps as CommunityQuestionSchemaProps } from '@/lib/site/content/schema/blocks/communityQuestion';

type CommunityQuestionProps = CommunityQuestionSchemaProps;

const STORAGE_PREFIX = 'community-question:';

// The answer never leaves the browser, so it is remembered the way AnnouncementDismiss remembers a
// dismissal: an external store whose server snapshot is empty, so the first client render still
// matches the HTML. The key is the question itself — publish a new question and the block starts
// over, which is what should happen.
const subscribe = (onChange: () => void) => {
	window.addEventListener('storage', onChange);

	return () => window.removeEventListener('storage', onChange);
};

const CommunityQuestion = ({
	label = 'Dit vroegen we op Discord.',
	question,
	options,
	resultLine,
	previousLine,
	colorset,
}: CommunityQuestionProps) => {
	const key = `${STORAGE_PREFIX}${question}`;
	const snapshots = useMemo(() => ({ get: () => window.localStorage.getItem(key), server: () => null }), [key]);
	const remembered = useSyncExternalStore(subscribe, snapshots.get, snapshots.server);

	const [picked, setPicked] = useState<string | null>(null);
	const chosen = picked ?? remembered;

	const total = options.reduce((sum, option) => sum + option.count, 0);
	const share = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

	const pick = (value: string) => {
		window.localStorage.setItem(key, value);
		setPicked(value);
	};

	const answers = options.map((option) => {
		const value = String(option.id);

		return {
			value,
			label: option.label,
			share: chosen ? share(option.count) : undefined,
			picked: value === chosen,
		};
	});

	return (
		<Section colorset={colorset ?? 'dark'} className="community-question">
			<Container>
				<div className="community-question-panel">
					<p className="community-question-label">{label}</p>
					<Title size={4} className="community-question-question" value={question} />

					<RadioGroup
						ariaLabel={question}
						className="community-question-options"
						value={chosen ?? undefined}
						onValueChange={pick}
						options={answers}
						pickedLabel="dit koos jij ook"
					/>

					{chosen ? (
						<Content element="p" className="community-question-note" value={resultLine.replace('{total}', String(total))} />
					) : (
						previousLine && <Content element="p" className="community-question-note" value={previousLine} />
					)}
				</div>
			</Container>
		</Section>
	);
};

export default CommunityQuestion;
