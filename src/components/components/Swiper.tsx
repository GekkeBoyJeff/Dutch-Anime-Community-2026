'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import VideoLightbox from '@/components/components/VideoLightbox';
import { classNames } from '@/lib/classNames';
import type { SwiperProps as SwiperSchemaProps, SwiperSlide } from '@/lib/content/schema/components/swiper';

export type { SwiperSlide };

export interface SwiperTranslations {
	/** Builds a slide's accessible position label @default '{index} of {total}' */
	slideLabel?: (details: { index: number; total: number }) => string;
	/** Builds the play button label for a titled video slide @default 'Play {title}' */
	playLabel?: (title: string) => string;
	/** Play button label when the video slide has no title @default 'Play video' */
	playFallbackLabel?: string;
	/** Sr-only word joining the current index and total in the counter @default 'of' */
	counterSeparatorLabel?: string;
	/** Label for the previous control @default 'Previous' */
	prevLabel?: string;
	/** Label for the next control @default 'Next' */
	nextLabel?: string;
}

const DEFAULT_TRANSLATIONS: Required<SwiperTranslations> = {
	slideLabel: ({ index, total }) => `${index} of ${total}`,
	playLabel: (title) => `Play ${title}`,
	playFallbackLabel: 'Play video',
	counterSeparatorLabel: 'of',
	prevLabel: 'Previous',
	nextLabel: 'Next',
};

export type SwiperProps = SwiperSchemaProps & {
	/** Localised strings; defaults to English */
	translations?: SwiperTranslations;
};

// Pointer/keyboard content swiper. The Embla viewport is the only client island; each slide is
// plain markup composed from the Media primitive. Prev/next + counter are built from the Embla API,
// and a video slide defers to the shared VideoLightbox instead of playing inline.
const Swiper = ({
	slides = [],
	ratio = '16 / 9',
	rounded = 'm',
	showCounter = true,
	loop = true,
	label = 'Swiper',
	translations,
	className,
	ref,
}: SwiperProps & { ref?: Ref<HTMLDivElement> }) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };
	const [emblaRef, embla] = useEmblaCarousel({ loop, align: 'start' });
	const [selected, setSelected] = useState(0);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(false);
	// The slide whose video the lightbox is showing; null when closed.
	const [activeVideo, setActiveVideo] = useState<SwiperSlide | null>(null);

	const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
	const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

	// Keep the selected index + arrow-enabled flags in sync with Embla's own state.
	useEffect(() => {
		if (!embla) {
			return undefined;
		}

		const sync = () => {
			setSelected(embla.selectedScrollSnap());
			setCanPrev(embla.canScrollPrev());
			setCanNext(embla.canScrollNext());
		};

		sync();
		embla.on('select', sync);
		embla.on('reInit', sync);

		return () => {
			embla.off('select', sync);
			embla.off('reInit', sync);
		};
	}, [embla]);

	if (slides.length === 0) {
		return null;
	}

	const frameStyle = ratio ? { aspectRatio: ratio } : undefined;

	return (
		<section ref={ref} className={classNames('swiper', `is-rounded-${rounded}`, className)} aria-roledescription="carousel" aria-label={label}>
			<div className="viewport" ref={emblaRef}>
				<div className="track">
					{slides.map((slide, index) => {
						const isVideo = Boolean(slide.embedId || slide.videoSrc);

						return (
							<div
								key={index}
								className="slide"
								role="group"
								aria-roledescription="slide"
								aria-label={t.slideLabel({ index: index + 1, total: slides.length })}
							>
								<div className="frame" style={frameStyle}>
									{isVideo ? (
										<Interactive className="play" onClick={() => setActiveVideo(slide)} aria-label={slide.title ? t.playLabel(slide.title) : t.playFallbackLabel}>
											{slide.image && <Media type="image" src={slide.image} alt={slide.alt} />}
											<span className="play-icon" aria-hidden="true" />
										</Interactive>
									) : slide.link ? (
										<Interactive url={slide.link} className="swiper-link">
											{slide.image && <Media type="image" src={slide.image} alt={slide.alt} />}
										</Interactive>
									) : (
										slide.image && <Media type="image" src={slide.image} alt={slide.alt} />
									)}
								</div>

								{(slide.title || slide.description) && (
									<div className="caption">
										{slide.title && <Content element="p" className="caption-title" value={slide.title} />}
										{slide.description && <Content element="p" className="caption-text" value={slide.description} />}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="controls">
				<Interactive className="control is-prev" onClick={scrollPrev} disabled={!canPrev} aria-label={t.prevLabel}>
					<span aria-hidden="true">&#8249;</span>
				</Interactive>

				{showCounter && (
					<Content element="p" className="counter" aria-live="polite">
						<Content element="span">{selected + 1}</Content>
						<span aria-hidden="true"> / </span>
						<VisuallyHidden>{t.counterSeparatorLabel}</VisuallyHidden>
						<Content element="span">{slides.length}</Content>
					</Content>
				)}

				<Interactive className="control is-next" onClick={scrollNext} disabled={!canNext} aria-label={t.nextLabel}>
					<span aria-hidden="true">&#8250;</span>
				</Interactive>
			</div>

			<VideoLightbox
				open={Boolean(activeVideo)}
				onClose={() => setActiveVideo(null)}
				provider={activeVideo?.provider}
				embedId={activeVideo?.embedId}
				src={activeVideo?.videoSrc}
				poster={activeVideo?.image}
				title={activeVideo?.title}
			/>
		</section>
	);
};

export default Swiper;
