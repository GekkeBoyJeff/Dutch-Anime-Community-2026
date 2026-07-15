import { z } from 'zod';

import { ArticleCardGridBlock } from '@/lib/content/schema/blocks/articleCardGrid';
import { BentoGridBlock } from '@/lib/content/schema/blocks/bentoGrid';
import { CTABannerBlock } from '@/lib/content/schema/blocks/ctaBanner';
import { EventCardGridBlock } from '@/lib/content/schema/blocks/eventCardGrid';
import { EventTeaserBlock } from '@/lib/content/schema/blocks/eventTeaser';
import { FaqAccordionBlock } from '@/lib/content/schema/blocks/faqAccordion';
import { FeatureCardsBlock } from '@/lib/content/schema/blocks/featureCards';
import { GrowingMediaOnScrollBlock } from '@/lib/content/schema/blocks/growingMediaOnScroll';
import { HeroBlock } from '@/lib/content/schema/blocks/hero';
import { HighlightCardsBlock } from '@/lib/content/schema/blocks/highlightCards';
import { IntroGridBlock } from '@/lib/content/schema/blocks/introGrid';
import { LinkCardGridBlock } from '@/lib/content/schema/blocks/linkCardGrid';
import { LogoCloudBlock } from '@/lib/content/schema/blocks/logoCloud';
import { PhotoMosaicBlock } from '@/lib/content/schema/blocks/photoMosaic';
import { ProfileCardsBlock } from '@/lib/content/schema/blocks/profileCards';
import { ProseBlock } from '@/lib/content/schema/blocks/prose';
import { ReviewsBlock } from '@/lib/content/schema/blocks/reviews';
import { ShowreelBlock } from '@/lib/content/schema/blocks/showreel';
import { SpotlightQuoteBlock } from '@/lib/content/schema/blocks/spotlightQuote';
import { StatBandBlock } from '@/lib/content/schema/blocks/statBand';
import { StepsBlock } from '@/lib/content/schema/blocks/steps';
import { StickyShowcaseBlock } from '@/lib/content/schema/blocks/stickyShowcase';
import { SubscribeToNewsletterBlock } from '@/lib/content/schema/blocks/subscribeNewsletter';
import { TextMediaBlock } from '@/lib/content/schema/blocks/textMedia';
import { TitleTextBlock } from '@/lib/content/schema/blocks/titleText';

// The block contract: a discriminated union on `type`. Adding a block = create its file in this
// folder, import it here, and add it to this union. This list is the visible inventory of every
// block type a page can contain.
export const Block = z.discriminatedUnion('type', [
	HeroBlock,
	FeatureCardsBlock,
	TextMediaBlock,
	ProseBlock,
	ReviewsBlock,
	CTABannerBlock,
	TitleTextBlock,
	IntroGridBlock,
	LogoCloudBlock,
	FaqAccordionBlock,
	HighlightCardsBlock,
	BentoGridBlock,
	ProfileCardsBlock,
	LinkCardGridBlock,
	StepsBlock,
	StatBandBlock,
	StickyShowcaseBlock,
	PhotoMosaicBlock,
	SpotlightQuoteBlock,
	GrowingMediaOnScrollBlock,
	ShowreelBlock,
	ArticleCardGridBlock,
	EventCardGridBlock,
	EventTeaserBlock,
	SubscribeToNewsletterBlock,
]);
export type Block = z.infer<typeof Block>;

export * from '@/lib/content/schema/blocks/hero';
export * from '@/lib/content/schema/blocks/featureCards';
export * from '@/lib/content/schema/blocks/textMedia';
export * from '@/lib/content/schema/blocks/prose';
export * from '@/lib/content/schema/blocks/reviews';
export * from '@/lib/content/schema/blocks/ctaBanner';
export * from '@/lib/content/schema/blocks/titleText';
export * from '@/lib/content/schema/blocks/introGrid';
export * from '@/lib/content/schema/blocks/logoCloud';
export * from '@/lib/content/schema/blocks/faqAccordion';
export * from '@/lib/content/schema/blocks/highlightCards';
export * from '@/lib/content/schema/blocks/bentoGrid';
export * from '@/lib/content/schema/blocks/profileCards';
export * from '@/lib/content/schema/blocks/linkCardGrid';
export * from '@/lib/content/schema/blocks/steps';
export * from '@/lib/content/schema/blocks/statBand';
export * from '@/lib/content/schema/blocks/stickyShowcase';
export * from '@/lib/content/schema/blocks/photoMosaic';
export * from '@/lib/content/schema/blocks/spotlightQuote';
export * from '@/lib/content/schema/blocks/growingMediaOnScroll';
export * from '@/lib/content/schema/blocks/showreel';
export * from '@/lib/content/schema/blocks/articleCardGrid';
export * from '@/lib/content/schema/blocks/eventCardGrid';
export * from '@/lib/content/schema/blocks/eventTeaser';
export * from '@/lib/content/schema/blocks/subscribeNewsletter';
