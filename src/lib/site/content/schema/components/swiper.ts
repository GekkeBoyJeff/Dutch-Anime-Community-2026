import { z } from 'zod';

import { MediaProvider } from '@/lib/site/content/schema/primitives';

export const SwiperSlide = z
	.object({
		image: z.string().optional().describe('Image (or video poster) source'),
		alt: z.string().optional().describe('Accessible description of the image/poster'),
		title: z.string().optional().describe('Heading shown in the slide caption'),
		description: z.string().optional().describe('Supporting line shown in the slide caption'),
		href: z.string().optional().describe('Optional whole-slide link target (ignored when the slide plays a video)'),
		provider: MediaProvider.optional().describe('Embed provider for a video slide; omit for a native `src` video'),
		embedId: z.string().optional().describe('The provider\'s video id (required for an embed slide)'),
		videoSrc: z.string().optional().describe('Direct video URL for a native-playback slide (when there is no provider)'),
	})
	.meta({ title: 'SwiperSlide' });
export type SwiperSlide = z.infer<typeof SwiperSlide>;

export const SwiperTranslations = z
	.object({
		slideLabel: z
			.custom<(details: { index: number; total: number }) => string>()
			.optional()
			.describe('Builds a slide\'s accessible position label; defaults to \'{index} of {total}\''),
		playLabel: z.custom<(title: string) => string>().optional().describe('Builds the play button label for a titled video slide; defaults to \'Play {title}\''),
		playFallbackLabel: z.string().optional().describe('Play button label when the video slide has no title; defaults to \'Play video\''),
		counterSeparatorLabel: z.string().optional().describe('Sr-only word joining the current index and total in the counter; defaults to \'of\''),
		prevLabel: z.string().optional().describe('Label for the previous control; defaults to \'Previous\''),
		nextLabel: z.string().optional().describe('Label for the next control; defaults to \'Next\''),
	})
	.meta({ title: 'SwiperTranslations' });
export type SwiperTranslations = z.infer<typeof SwiperTranslations>;

export const SwiperProps = z
	.object({
		slides: z.array(SwiperSlide).optional().describe('The slides to show'),
		ratio: z.string().optional().describe('Aspect ratio of each slide frame, e.g. \'16 / 9\''),
		rounded: z.enum(['s', 'm', 'l', 'xl', 'full']).optional().describe('Corner rounding of the viewport (xl maps to the large radius)'),
		showCounter: z.boolean().optional().describe('Show the \'current / total\' counter beside the controls'),
		loop: z.boolean().optional().describe('Loop back to the first slide after the last'),
		ariaLabel: z.string().optional().describe('Accessible label for the swiper region; defaults to \'Swiper\''),
		translations: SwiperTranslations.optional().describe('Localised strings; defaults to English'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Swiper' });
export type SwiperProps = z.infer<typeof SwiperProps>;
