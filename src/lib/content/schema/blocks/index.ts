import { z } from 'zod';

import { BentoGridBlock } from '@/lib/content/schema/blocks/bentoGrid';
import { CardGridBlock } from '@/lib/content/schema/blocks/cardGrid';
import { ChannelBoardBlock } from '@/lib/content/schema/blocks/channelBoard';
import { ChatPreviewBlock } from '@/lib/content/schema/blocks/chatPreview';
import { CommunityQuestionBlock } from '@/lib/content/schema/blocks/communityQuestion';
import { CTABannerBlock } from '@/lib/content/schema/blocks/ctaBanner';
import { EventTeaserBlock } from '@/lib/content/schema/blocks/eventTeaser';
import { FaqAccordionBlock } from '@/lib/content/schema/blocks/faqAccordion';
import { FeatureCardsBlock } from '@/lib/content/schema/blocks/featureCards';
import { GrowingMediaOnScrollBlock } from '@/lib/content/schema/blocks/growingMediaOnScroll';
import { HeroBlock } from '@/lib/content/schema/blocks/hero';
import { HighlightCardsBlock } from '@/lib/content/schema/blocks/highlightCards';
import { IntroGridBlock } from '@/lib/content/schema/blocks/introGrid';
import { LogoCloudBlock } from '@/lib/content/schema/blocks/logoCloud';
import { MomentListBlock } from '@/lib/content/schema/blocks/momentList';
import { PhotoMosaicBlock } from '@/lib/content/schema/blocks/photoMosaic';
import { ProfileCardsBlock } from '@/lib/content/schema/blocks/profileCards';
import { ProofTickerBlock } from '@/lib/content/schema/blocks/proofTicker';
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
	CardGridBlock,
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
	StepsBlock,
	StatBandBlock,
	StickyShowcaseBlock,
	PhotoMosaicBlock,
	SpotlightQuoteBlock,
	GrowingMediaOnScrollBlock,
	ShowreelBlock,
	EventTeaserBlock,
	SubscribeToNewsletterBlock,
	CommunityQuestionBlock,
	ChatPreviewBlock,
	ChannelBoardBlock,
	MomentListBlock,
	ProofTickerBlock,
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
export * from '@/lib/content/schema/blocks/cardGrid';
export * from '@/lib/content/schema/blocks/profileCards';
export * from '@/lib/content/schema/blocks/steps';
export * from '@/lib/content/schema/blocks/statBand';
export * from '@/lib/content/schema/blocks/stickyShowcase';
export * from '@/lib/content/schema/blocks/photoMosaic';
export * from '@/lib/content/schema/blocks/spotlightQuote';
export * from '@/lib/content/schema/blocks/growingMediaOnScroll';
export * from '@/lib/content/schema/blocks/showreel';
export * from '@/lib/content/schema/blocks/eventTeaser';
export * from '@/lib/content/schema/blocks/subscribeNewsletter';
export * from '@/lib/content/schema/blocks/communityQuestion';
export * from '@/lib/content/schema/blocks/chatPreview';
export * from '@/lib/content/schema/blocks/channelBoard';
export * from '@/lib/content/schema/blocks/momentList';
export * from '@/lib/content/schema/blocks/proofTicker';
