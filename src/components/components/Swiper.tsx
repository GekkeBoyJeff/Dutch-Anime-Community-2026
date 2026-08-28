'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import VideoLightbox from '@/components/components/VideoLightbox';
import { classNames } from '@/lib/shared/classNames';
import type { SwiperProps as SwiperSchemaProps, SwiperSlide, SwiperTranslations } from '@/lib/site/content/schema/components/swiper';

export type { SwiperSlide, SwiperTranslations };

const DEFAULT_TRANSLATIONS: Required<SwiperTranslations> = {
	slideLabel: ({ index, total }) => `${index} of ${total}`,
	playLabel: (title) => `Play ${title}`,
	playFallbackLabel: 'Play video',
	counterSeparatorLabel: 'of',
	prevLabel: 'Previous',
	nextLabel: 'Next',
};

export type SwiperProps = SwiperSchemaProps;

const Swiper = ({
	slides = [],
	ratio = '16 / 9',
	rounded = 'm',
	showCounter = true,
	loop = true,
	ariaLabel = 'Swiper',
	translations,
	className,
}: SwiperProps) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };
	const [emblaRef, embla] = useEmblaCarousel({ loop, align: 'start' });
	const [selected, setSelected] = useState(0);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(false);
	const [activeVideo, setActiveVideo] = useState<SwiperSlide | null>(null);

	const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
	const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

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
		<section className={classNames('swiper', `is-rounded-${rounded}`, className)} aria-roledescription="carousel" aria-label={ariaLabel}>
			<div className="swiper-viewport" ref={emblaRef}>
				<div className="swiper-track">
					{slides.map((slide, index) => {
						const isVideo = Boolean(slide.embedId || slide.videoSrc);

						return (
							<div
								key={index}
								className="swiper-slide"
								role="group"
								aria-roledescription="slide"
								aria-label={t.slideLabel({ index: index + 1, total: slides.length })}
							>
								<div className="swiper-frame" style={frameStyle}>
									{isVideo ? (
										<Interactive className="swiper-play" onClick={() => setActiveVideo(slide)} ariaLabel={slide.title ? t.playLabel(slide.title) : t.playFallbackLabel}>
											{slide.image && <Media type="image" src={slide.image} alt={slide.alt} />}
											<span className="swiper-play-icon" aria-hidden="true" />
										</Interactive>
									) : slide.href ? (
										<Interactive url={slide.href} className="swiper-link">
											{slide.image && <Media type="image" src={slide.image} alt={slide.alt} />}
										</Interactive>
									) : (
										slide.image && <Media type="image" src={slide.image} alt={slide.alt} />
									)}
								</div>

								{(slide.title || slide.description) && (
									<div className="caption">
										{slide.title && <Content element="p" className="swiper-caption-title" value={slide.title} />}
										{slide.description && <Content element="p" className="swiper-caption-text" value={slide.description} />}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="swiper-controls">
				<Interactive className="swiper-control is-prev" onClick={scrollPrev} disabled={!canPrev} ariaLabel={t.prevLabel}>
					<span aria-hidden="true">&#8249;</span>
				</Interactive>

				{showCounter && (
					<p className="content swiper-counter" aria-live="polite">
						<Content element="span" value={String(selected + 1)} />
						<span aria-hidden="true"> / </span>
						<VisuallyHidden value={t.counterSeparatorLabel} />
						<Content element="span" value={String(slides.length)} />
					</p>
				)}

				<Interactive className="swiper-control is-next" onClick={scrollNext} disabled={!canNext} ariaLabel={t.nextLabel}>
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
