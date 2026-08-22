'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import type { Ref } from 'react';

import Button from '@/components/basics/Button';
import type { NavCta } from '@/lib/content/schema/structures/navigation';
import type { StickyCtaProps as StickyCtaSchemaProps } from '@/lib/content/schema/structures/stickyCta';

type StickyCtaProps = StickyCtaSchemaProps & {
	/** The site's one call to action — the same object the header renders */
	cta: NavCta;
};

// Whether the hero has scrolled past. Read as an external store so the server and the first client
// render agree (the bar starts hidden), the same way the repo reads other browser state. The observer
// only fires when the hero crosses the edge, so there is no work while scrolling. A page without a
// hero has nothing to subscribe to and nothing to wait for, so the bar simply shows.
const subscribe = (onChange: () => void) => {
	const hero = document.querySelector('.hero');
	if (!hero) return () => {};

	const observer = new IntersectionObserver(onChange, { threshold: 0 });
	observer.observe(hero);

	return () => observer.disconnect();
};

const getSnapshot = () => {
	const hero = document.querySelector('.hero');

	return hero ? hero.getBoundingClientRect().bottom <= 0 : true;
};

const getServerSnapshot = () => false;

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path);

// The one action, within reach on every small screen. It waits for the hero to pass: putting a second
// gold button on the screen that already carries the strongest one would compete with it rather than
// help. Above the layout's wide breakpoint the header shows the same button and this bar stays away.
const StickyCta = ({ cta, excludePaths = [], ref }: StickyCtaProps & { ref?: Ref<HTMLDivElement> }) => {
	const pathname = usePathname();
	const passedHero = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	if (excludePaths.map(normalise).includes(normalise(pathname))) {
		return null;
	}

	return (
		<div ref={ref} className="sticky-cta" data-visible={passedHero || undefined}>
			<Button className="sticky-cta-button" url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'}>
				{cta.label}
			</Button>
		</div>
	);
};

export default StickyCta;
