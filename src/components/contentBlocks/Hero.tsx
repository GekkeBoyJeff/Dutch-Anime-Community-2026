import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import type { HeroProps } from '@/lib/content';

// A page's lead section: tagline, heading, intro and call-to-action buttons — rendered plain, inside
// a rounded media panel, or as a full-bleed cover with a glass stats bar and a link tab carved into
// the bottom-left corner of the page frame.
const Hero = ({
	variant = 'panel',
	tagline,
	title,
	text,
	actions = [],
	stats = [],
	socials = [],
	media,
	colorset,
	ref,
}: HeroProps & { ref?: Ref<HTMLElement> }) => {
	const isCover = variant === 'cover' && !!media;

	const body = (
		<div className="body">
			{tagline && <Content element="span" className="tagline" value={tagline} />}
			{title && <Title size={1} value={title} />}
			{isCover && <span className="divider" aria-hidden="true" />}
			{text && <Content value={text} />}

			<Actions actions={actions} defaultVariant="primary" badge />
		</div>
	);

	const statsBar = stats.length > 0 && (
		<div className="stats">
			{stats.map((stat) => {
				return (
					<div key={stat.label} className="item">
						<span className="count">{stat.count}</span>
						<span className="label">{stat.label}</span>
					</div>
				);
			})}
		</div>
	);

	if (isCover) {
		return (
			<Section ref={ref} colorset={colorset} className="hero is-cover">
				<Media {...media} className="backdrop" />

				<Container className="inner">
					{body}
					{statsBar}
				</Container>

				{socials.length > 0 && (
					<div className="hero-tab">
						<span className="corner is-scoop-tr is-start" aria-hidden="true" />
						{socials.map((social, index) => {
							return (
								<Interactive key={`${social.label}-${index}`} url={social.url} target={social.target} className="hero-tab-link">
									{social.icon && <Icon name={social.icon} />}
									{social.label}
								</Interactive>
							);
						})}
						<span className="corner is-scoop-tr is-end" aria-hidden="true" />
					</div>
				)}
			</Section>
		);
	}

	return (
		<Section ref={ref} colorset={colorset} className="hero">
			<Container>
				{media ? (
					<div className="panel" data-colorset="dark">
						<Media {...media} className="backdrop" />

						<div className="inner">
							{body}
							{statsBar}
						</div>
					</div>
				) : (
					body
				)}
			</Container>
		</Section>
	);
};

export default Hero;
