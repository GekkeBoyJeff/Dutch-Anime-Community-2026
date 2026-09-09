import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import type { HeroProps as HeroSchemaProps } from '@/lib/site/content/schema/blocks/hero';

// `eager` is a render hint Blocks derives from a block's position, not content, so it stays out of the content schema.
type HeroProps = HeroSchemaProps & { eager?: boolean };

const Hero = ({
	variant = 'panel',
	tagline,
	title,
	value,
	actions = [],
	stats = [],
	socials = [],
	media,
	colorset,
	eager,
}: HeroProps) => {
	const isCover = variant === 'cover' && !!media;

	const body = (
		<div className="hero-body">
			{tagline && <Content element="span" className="hero-tagline" value={tagline} />}
			{title && <Title size={1} value={title} />}
			{isCover && <span className="hero-divider" aria-hidden="true" />}
			{value && <Content value={value} />}

			<Actions actions={actions} defaultVariant="primary" />
		</div>
	);

	const statsBar = stats.length > 0 && (
		<div className="hero-stats">
			{stats.map((stat) => {
				return (
					<div key={stat.label} className="hero-item">
						<span className="hero-count">{stat.count}</span>
						<span className="hero-label">{stat.label}</span>
					</div>
				);
			})}
		</div>
	);

	if (isCover) {
		return (
			<Section colorset={colorset} className="hero is-cover">
				<Media {...media} eager={eager} className="hero-backdrop" />

				<Container className="hero-inner">
					{body}
					{statsBar}
				</Container>

				{socials.length > 0 && (
					<div className="hero-tab">
						<span className="corner is-scoop-tr is-start" aria-hidden="true" />
						{socials.map((social, index) => {
							return (
								<Interactive key={`${social.value}-${index}`} url={social.url} target={social.target} className="hero-tab-link">
									{social.icon && <Icon name={social.icon} />}
									{social.value}
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
		<Section colorset={colorset} className="hero">
			<Container>
				{media ? (
					<div className="hero-panel" data-colorset="dark">
						<Media {...media} eager={eager} className="hero-backdrop" />

						<div className="hero-inner">
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
