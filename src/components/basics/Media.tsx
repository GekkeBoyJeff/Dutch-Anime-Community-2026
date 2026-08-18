import type { CSSProperties, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { MediaProps as MediaData } from '@/lib/content/schema/basics/media';
import { compileSizes, getImage, variantsToSrcSet, withBasePath } from '@/lib/images';

// Source URL per embed provider in one place, so no caller has to hand-write an <iframe>.
const EMBEDS: Record<'youtube' | 'vimeo' | 'tiktok' | 'wistia', (id: string) => string> = {
	youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
	vimeo: (id) => `https://player.vimeo.com/video/${id}`,
	tiktok: (id) => `https://www.tiktok.com/embed/v2/${id}`,
	wistia: (id) => `https://fast.wistia.net/embed/iframe/${id}`,
};

// The Media content shape from the schema, so the component can't drift from the contract. `eager` is
// deliberately not part of it: Blocks derives it from position, so no author can set it wrong.
type MediaProps = MediaData & {
	/** The page's leading image: loaded eagerly at high fetch priority instead of lazily. */
	eager?: boolean;
};

// Renders an image (native <picture> + a build-time webp srcset from the manifest, no next/image), a
// video or an embed inside a fixed-ratio frame, plus caption/credit. `sizes` drives which variant the
// browser fetches; `ratio` overrides the frame ratio; `mode` chooses cover vs contain.
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
	variant = 'framed',
	width,
	height,
	eager = false,
	className,
	ref,
}: MediaProps & { ref?: Ref<HTMLElement> }) => {
	const ratioStyle: CSSProperties | undefined = ratio ? { aspectRatio: ratio } : undefined;
	const image = type === 'image' && src ? getImage(src) : undefined;

	const loadingProps = eager
		? ({ loading: 'eager', fetchPriority: 'high' } as const)
		: ({ loading: 'lazy', decoding: 'async' } as const);

	// `auto` picks from the srcset using the width the element actually got, so the layout is never
	// restated here. Lazy images only; browsers without it fall through to the 100vw after the comma.
	const defaultSizes = eager ? '100vw' : 'auto, 100vw';

	// 'plain' skips the frame entirely: the bare asset at its natural size (logos, wordmarks,
	// mascots) — no ratio box, no background, no crop. Images only; other types keep the frame.
	if (variant === 'plain' && type === 'image' && src) {
		// A plain image occupies its own width, not the viewport, so that width is what `sizes` must
		// report. The srcset carries w descriptors, so the browser multiplies it by the device pixel
		// ratio itself — a 48px logo fetches 96px on a 2x screen and 144px on a 3x one. Left on the
		// '100vw' default it would size for the viewport and pull a full-width variant for a logo.
		const displayWidth = width ?? image?.width;

		return (
			<figure ref={ref} className={classNames('media', 'is-plain', className)}>
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

				{(caption || credit) && (
					<figcaption className="caption">
						{caption && <span>{caption}</span>}
						{credit && <span className="media-credit">{credit}</span>}
					</figcaption>
				)}
			</figure>
		);
	}

	return (
		<figure ref={ref} className={classNames('media', `is-${mode}`, className)}>
			{/* The frame carries the aspect ratio (default 16/9 in the stylesheet) for every media type. */}
			<div className="media-frame" style={ratioStyle}>
				{type === 'image' && src && (
					<picture>
						{image && <source type="image/webp" srcSet={variantsToSrcSet(image.variants)} sizes={compileSizes(sizes ?? defaultSizes)} />}
						{/* next/image not used here — Media is deliberately native-img-first; <img> inside <picture> is exempt from @next/next/no-img-element. */}
						<img src={withBasePath(src)} alt={alt} className="media-asset" width={image?.width} height={image?.height} {...loadingProps} />
					</picture>
				)}

				{type === 'video' && <video src={withBasePath(src)} className="media-asset" controls playsInline />}

				{type === 'embed' && (
					<iframe
						src={provider && embedId ? EMBEDS[provider]?.(embedId) : undefined}
						title={alt || caption || 'Embedded media'}
						className="media-asset"
						loading="lazy"
						allowFullScreen
					/>
				)}
			</div>

			{(caption || credit) && (
				<figcaption className="caption">
					{caption && <span>{caption}</span>}
					{credit && <span className="media-credit">{credit}</span>}
				</figcaption>
			)}
		</figure>
	);
};

export default Media;
