import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { EmbedWidgetProps as EmbedWidgetSchemaProps } from '@/lib/site/content/schema/components/embedWidget';

type EmbedWidgetProps = EmbedWidgetSchemaProps;

const EmbedWidget = ({
	provider,
	embedId,
	src,
	title,
	ratio = '16 / 9',
	caption,
	children,
	iframeLabel = 'Embedded media',
	className,
}: EmbedWidgetProps) => {
	return (
		<section className={classNames('embed-widget', className)}>
			{title && <Title element="h3" size={5} value={title} className="embed-widget-title" />}

			{children ? (
				<div className="embed-widget-frame" style={{ aspectRatio: ratio }}>
					{children}
				</div>
			) : provider && embedId ? (
				<Media
					type="embed"
					provider={provider}
					embedId={embedId}
					alt={title}
					ratio={ratio}
					caption={caption}
					className="embed-widget-media"
				/>
			) : (
				src && (
					<div className="embed-widget-frame" style={{ aspectRatio: ratio }}>
						<iframe
							src={src}
							title={title ?? caption ?? iframeLabel}
							className="embed-widget-iframe"
							loading="lazy"
							allowFullScreen
						/>
					</div>
				)
			)}

			{caption && !provider && <Content size="small" value={caption} className="embed-widget-caption" />}
		</section>
	);
};

export default EmbedWidget;
