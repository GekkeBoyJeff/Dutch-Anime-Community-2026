import { theme } from '@/design-system/theme.generated';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

interface OgCardProps {
	title: string;
	description: string;
}

// satori (next/og) renders outside the DOM and cannot read CSS variables, so the colours come from
// theme.generated.ts, which styles.config.mjs derives from theme.scss by compiling it.
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
				backgroundColor: theme.backgroundDark,
				color: theme.page,
			}}
		>
			<div style={{
				display: 'flex',
				width: '72px',
				height: '8px',
				backgroundColor: theme.primary,
			}} />
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{
					fontSize: '76px',
					fontWeight: 700,
					lineHeight: 1.05,
				}}>{title}</div>
				<div style={{
					fontSize: '32px',
					color: theme.ogMuted,
					marginTop: '20px',
				}}>{description}</div>
			</div>
		</div>
	);
};
