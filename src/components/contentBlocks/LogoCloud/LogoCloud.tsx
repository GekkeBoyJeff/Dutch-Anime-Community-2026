import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Interactive from '@/components/basics/Interactive/Interactive';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';

import type { LogoCloudProps as LogoCloudSchemaProps, LogoItem } from './LogoCloud.schema';

import './LogoCloud.scss';

type LogoCloudProps = LogoCloudSchemaProps;

const Logo = ({ item }: { item: LogoItem }) => {
	const image = (
		<Media variant="plain" type="image" src={item.logo} alt={item.name} width={160} height={48} className="logo-cloud-logo-media" />
	);

	return item.href ? (
		<Interactive className="logo-cloud-link" url={item.href} ariaLabel={item.name}>
			{image}
		</Interactive>
	) : (
		image
	);
};

const LogoCloud = ({
	heading,
	value,
	items = [],
	variant = 'grid',
	colorset,
}: LogoCloudProps) => {
	const logoItems = items.map((item) => (
		<li key={item.id} className="logo-cloud-logo">
			<Logo item={item} />
		</li>
	));

	return (
		<Section colorset={colorset} className="logo-cloud">
			<Container>
				{heading && <HeadingGroup {...heading} align="center" className="logo-cloud-heading" />}

				{value && <Content className="logo-cloud-description" value={value} />}

				{variant === 'marquee' ? (
					<div className="logo-cloud-marquee">
						<ul className="logo-cloud-track" aria-label="Logos">
							{logoItems}
						</ul>
						{/* A second copy, hidden from assistive tech, makes the loop seamless. */}
						<ul className="logo-cloud-track" aria-hidden="true">
							{logoItems}
						</ul>
					</div>
				) : (
					<ul className="logo-cloud-row">{logoItems}</ul>
				)}
			</Container>
		</Section>
	);
};

export default LogoCloud;
