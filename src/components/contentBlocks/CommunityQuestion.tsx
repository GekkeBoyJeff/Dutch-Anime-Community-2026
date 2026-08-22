'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import RadioGroup from '@/components/forms/RadioGroup';
import type { CommunityQuestionProps } from '@/lib/content';

const STORAGE_PREFIX = 'community-question:';

// The answer never leaves the browser, so it is remembered the way AnnouncementDismiss remembers a
// dismissal: an external store whose server snapshot is empty, so the first client render still
// matches the HTML. The key is the question itself — publish a new question and the block starts
// over, which is what should happen.
const subscribe = (onChange: () => void) => {
	window.addEventListener('storage', onChange);

	return () => window.removeEventListener('storage', onChange);
};

// The question of the month. The answers come from a poll the community already ran elsewhere and are
// baked in as content; picking one here only marks which answer is yours. Nothing is sent, counted or
// added up — the reward is seeing where you stand, not taking part in a tally.
const CommunityQuestion = ({
	label = 'Dit vroegen we op Discord.',
	question,
	options,
	resultLine,
	previousLine,
	colorset,
	ref,
}: CommunityQuestionProps & { ref?: Ref<HTMLElement> }) => {
	const key = `${STORAGE_PREFIX}${question}`;
	const snapshots = useMemo(() => ({ get: () => window.localStorage.getItem(key), server: () => null }), [key]);
	const remembered = useSyncExternalStore(subscribe, snapshots.get, snapshots.server);

	// This session's pick wins over the remembered one, so changing your mind shows straight away.
	const [picked, setPicked] = useState<string | null>(null);
	const chosen = picked ?? remembered;

	const total = options.reduce((sum, option) => sum + option.count, 0);
	const share = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

	const pick = (value: string) => {
		window.localStorage.setItem(key, value);
		setPicked(value);
	};

	// One row per answer: the text, and once a choice is made the share, the fill and — on your own
	// answer — a check. The row is the click target; the radio itself is hidden but still focusable.
	const answers = options.map((option) => {
		// Ids are string | number in content; a radio value and a storage key are text.
		const value = String(option.id);

		return {
			value,
			label: (
				<span className="community-question-answer">
					{chosen && (
						<span
							className="community-question-bar"
							style={{ '--share': `${share(option.count)}%` } as React.CSSProperties}
							aria-hidden="true"
						/>
					)}
					<span className="community-question-answer-text">{option.label}</span>
					{chosen && <span className="community-question-share">{share(option.count)}%</span>}
					{value === chosen && (
						<>
							<Icon name="check" className="community-question-check" />
							<VisuallyHidden>dit koos jij ook</VisuallyHidden>
						</>
					)}
				</span>
			),
		};
	});

	return (
		<Section ref={ref} colorset={colorset ?? 'dark'} className="community-question">
			<Container>
				<div className="community-question-panel">
					<p className="community-question-label">{label}</p>
					<Title size={4} className="community-question-question" value={question} />

					<RadioGroup
						aria-label={question}
						className="community-question-options"
						value={chosen ?? undefined}
						onValueChange={pick}
						options={answers}
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
