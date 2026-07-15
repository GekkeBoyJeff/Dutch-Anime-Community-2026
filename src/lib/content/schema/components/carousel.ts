import { z } from 'zod';

import { MediaProvider } from '@/lib/content/schema/primitives';

// One slide's content. An image slide shows its Media; a video slide shows the poster and opens the
// shared VideoLightbox on click (native `src` or a provider embed).
export const CarouselSlide = z
	.object({
		image: z.string().optional().describe('Image (or video poster) source'),
		alt: z.string().optional().describe('Accessible description of the image/poster'),
		title: z.string().optional().describe('Heading shown in the slide caption'),
		description: z.string().optional().describe('Supporting line shown in the slide caption'),
		link: z.string().optional().describe('Optional whole-slide link target (ignored when the slide plays a video)'),
		provider: MediaProvider.optional().describe('Embed provider for a video slide; omit for a native `src` video'),
		embedId: z.string().optional().describe('The provider\'s video id (required for an embed slide)'),
		videoSrc: z.string().optional().describe('Direct video URL for a native-playback slide (when there is no provider)'),
	})
	.meta({ title: 'CarouselSlide' });
export type CarouselSlide = z.infer<typeof CarouselSlide>;

// Props for the Carousel component: pointer/keyboard content carousel built on Embla, with slide
// captions, an optional counter, and a video slide that opens the shared VideoLightbox.
export const CarouselProps = z
	.object({
		slides: z.array(CarouselSlide).optional().describe('The slides to show'),
		ratio: z.string().optional().describe('Aspect ratio of each slide frame, e.g. \'16 / 9\''),
		rounded: z.enum(['s', 'm', 'l', 'xl', 'full']).optional().describe('Corner rounding of the viewport (xl maps to the large radius)'),
		showCounter: z.boolean().optional().describe('Show the \'current / total\' counter beside the controls'),
		loop: z.boolean().optional().describe('Loop back to the first slide after the last'),
		label: z.string().optional().describe('Accessible label for the carousel region; defaults to \'Carousel\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Carousel' });
export type CarouselProps = z.infer<typeof CarouselProps>;
