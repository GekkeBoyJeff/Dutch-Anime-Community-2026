import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import type { LogoCloudProps, LogoItem } from '@/lib/content';

// One logo image, wrapped in a link when the item has an href. The name is the alt text (and the
// link label), so the strip stays accessible. Media 'plain' renders the bare asset at natural size.
const Logo = ({ item }: { item: LogoItem }) => {
	const image = (
		<Media variant="plain" type="image" src={item.logo} alt={item.name} width={160} height={48} className="logo-media" />
	);

	return item.href ? (
		<Interactive className="logo-cloud-link" url={item.href} aria-label={item.name}>
			{image}
		</Interactive>
	) : (
		image
	);
};

// A customer/partner logo strip. `grid` wraps the logos in a row; `marquee` scrolls them in a
// continuous CSS loop (the list is rendered twice so the loop is seamless). Server Component — no
// JS; the scroll and the grayscale-on-rest hover are pure CSS.
const LogoCloud = ({
	heading,
	description,
	items = [],
	variant = 'grid',
	colorset,
	ref,
}: LogoCloudProps & { ref?: Ref<HTMLElement> }) => {
	const logoItems = items.map((item) => (
		<li key={item.id} className="logo">
			<Logo item={item} />
		</li>
	));

	return (
		<Section ref={ref} colorset={colorset} className="logo-cloud">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						align="center"
						className="logo-cloud-heading"
					/>
				)}

				{description && <Content className="description" value={description} />}

				{variant === 'marquee' ? (
					<div className="marquee">
						<ul className="track" aria-label="Logos">
							{logoItems}
						</ul>
						{/* A second copy, hidden from assistive tech, makes the loop seamless. */}
						<ul className="track" aria-hidden="true">
							{logoItems}
						</ul>
					</div>
				) : (
					<ul className="row">{logoItems}</ul>
				)}
			</Container>
		</Section>
	);
};

export default LogoCloud;
