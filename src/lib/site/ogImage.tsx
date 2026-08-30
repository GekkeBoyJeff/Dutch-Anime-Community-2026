import { brand } from '@/lib/site/site';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

interface OgCardProps {
	title: string;
	description: string;
}

// satori (next/og) renders outside the DOM and cannot read CSS variables, so the colours come from
// the `brand` constant instead of the SCSS tokens.
export const OgCard = ({ title, description }: OgCardProps) => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '80px',
				backgroundColor: brand.ink,
				color: brand.page,
			}}
		>
			<div style={{ display: 'flex', width: '72px', height: '8px', backgroundColor: brand.primary }} />
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ fontSize: '76px', fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
				<div style={{ fontSize: '32px', color: brand.subtle, marginTop: '20px' }}>{description}</div>
			</div>
		</div>
	);
};
