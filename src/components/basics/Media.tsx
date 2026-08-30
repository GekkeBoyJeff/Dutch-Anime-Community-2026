import type { CSSProperties } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { MediaProps as MediaSchemaProps } from '@/lib/site/content/schema/basics/media';
import type { MediaProvider } from '@/lib/site/content/schema/primitives';
import { compileSizes, getImage, variantsToSrcSet, withBasePath } from '@/lib/site/images';

const EMBEDS: Record<MediaProvider, (id: string) => string> = {
	youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
	vimeo: (id) => `https://player.vimeo.com/video/${id}`,
	tiktok: (id) => `https://www.tiktok.com/embed/v2/${id}`,
	wistia: (id) => `https://fast.wistia.net/embed/iframe/${id}`,
};

type MediaProps = MediaSchemaProps;

const Media = ({
	type = 'image',
	src,
	provider,
	embedId,
	alt = '',
	ratio,
	caption,
	credit,
	sizes,
	mode = 'fill',
	variant,
	width,
	height,
	eager = false,
	className,
}: MediaProps) => {
	const ratioStyle: CSSProperties | undefined = ratio ? { aspectRatio: ratio } : undefined;
	const image = type === 'image' && src ? getImage(src) : undefined;

	const loadingProps = eager
		? ({ loading: 'eager', fetchPriority: 'high' } as const)
		: ({ loading: 'lazy', decoding: 'async' } as const);

	// The `auto` is not a stray value: browsers that support it measure the lazy image themselves, and
	// the ones that don't fall through to the 100vw after the comma.
	const defaultSizes = eager ? '100vw' : 'auto, 100vw';

	const figcaption = (caption || credit) && (
		<figcaption className="caption">
			{caption && <span>{caption}</span>}
			{credit && <span className="media-credit">{credit}</span>}
		</figcaption>
	);

	if (variant === 'plain' && type === 'image' && src) {
		const displayWidth = width ?? image?.width;

		return (
			<figure className={classNames('media', 'is-plain', className)}>
				<picture>
					{image && (
						<source
							type="image/webp"
							srcSet={variantsToSrcSet(image.variants)}
							sizes={compileSizes(sizes ?? (displayWidth ? `${displayWidth}px` : undefined))}
						/>
					)}
					<img
						src={withBasePath(src)}
						alt={alt}
						className="media-asset"
						width={image?.width ?? width}
						height={image?.height ?? height}
						{...loadingProps}
					/>
				</picture>

				{figcaption}
			</figure>
		);
	}

	return (
		<figure className={classNames('media', `is-${mode}`, className)}>
			<div className="media-frame" style={ratioStyle}>
				{type === 'image' && src && (
					<picture>
						{image && <source type="image/webp" srcSet={variantsToSrcSet(image.variants)} sizes={compileSizes(sizes ?? defaultSizes)} />}
						<img src={withBasePath(src)} alt={alt} className="media-asset" width={image?.width} height={image?.height} {...loadingProps} />
					</picture>
				)}

				{type === 'video' && <video src={withBasePath(src)} className="media-asset" controls playsInline />}

				{type === 'embed' && (
					<iframe
						src={provider && embedId ? EMBEDS[provider](embedId) : undefined}
						title={alt || caption || 'Embedded media'}
						className="media-asset"
						loading="lazy"
						allowFullScreen
					/>
				)}
			</div>

			{figcaption}
		</figure>
	);
};

export default Media;
