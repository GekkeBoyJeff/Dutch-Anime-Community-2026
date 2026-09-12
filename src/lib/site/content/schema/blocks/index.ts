import { z } from 'zod';

import { BentoGridBlock } from '@/lib/site/content/schema/blocks/bentoGrid';
import { CardGridBlock } from '@/lib/site/content/schema/blocks/cardGrid';
import { ChannelBoardBlock } from '@/lib/site/content/schema/blocks/channelBoard';
import { ChatPreviewBlock } from '@/lib/site/content/schema/blocks/chatPreview';
import { CommunityQuestionBlock } from '@/lib/site/content/schema/blocks/communityQuestion';
import { CTABannerBlock } from '@/lib/site/content/schema/blocks/ctaBanner';
import { EventTeaserBlock } from '@/lib/site/content/schema/blocks/eventTeaser';
import { FaqAccordionBlock } from '@/lib/site/content/schema/blocks/faqAccordion';
import { FeatureCardsBlock } from '@/lib/site/content/schema/blocks/featureCards';
import { GrowingMediaOnScrollBlock } from '@/lib/site/content/schema/blocks/growingMediaOnScroll';
import { HeroBlock } from '@/lib/site/content/schema/blocks/hero';
import { HighlightCardsBlock } from '@/lib/site/content/schema/blocks/highlightCards';
import { IntroGridBlock } from '@/lib/site/content/schema/blocks/introGrid';
import { LogoCloudBlock } from '@/lib/site/content/schema/blocks/logoCloud';
import { MomentListBlock } from '@/lib/site/content/schema/blocks/momentList';
import { PhotoMosaicBlock } from '@/lib/site/content/schema/blocks/photoMosaic';
import { ProfileCardsBlock } from '@/lib/site/content/schema/blocks/profileCards';
import { ProofTickerBlock } from '@/lib/site/content/schema/blocks/proofTicker';
import { ProseBlock } from '@/lib/site/content/schema/blocks/prose';
import { ReviewsBlock } from '@/lib/site/content/schema/blocks/reviews';
import { ShowreelBlock } from '@/lib/site/content/schema/blocks/showreel';
import { SpotlightQuoteBlock } from '@/lib/site/content/schema/blocks/spotlightQuote';
import { StatBandBlock } from '@/lib/site/content/schema/blocks/statBand';
import { StepsBlock } from '@/lib/site/content/schema/blocks/steps';
import { StickyShowcaseBlock } from '@/lib/site/content/schema/blocks/stickyShowcase';
import { SubscribeToNewsletterBlock } from '@/lib/site/content/schema/blocks/subscribeToNewsletter';
import { TextMediaBlock } from '@/lib/site/content/schema/blocks/textMedia';
import { TitleTextBlock } from '@/lib/site/content/schema/blocks/titleText';

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

