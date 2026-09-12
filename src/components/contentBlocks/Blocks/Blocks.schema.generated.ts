// GENERATED from the folders in src/components/contentBlocks by scripts/generate-blocks.mjs.
// Do not edit by hand: add a block by adding its folder.
import { z } from 'zod';

import { BentoGridBlock } from '@/components/contentBlocks/BentoGrid/BentoGrid.schema';
import { CardGridBlock } from '@/components/contentBlocks/CardGrid/CardGrid.schema';
import { ChannelBoardBlock } from '@/components/contentBlocks/ChannelBoard/ChannelBoard.schema';
import { ChatPreviewBlock } from '@/components/contentBlocks/ChatPreview/ChatPreview.schema';
import { CommunityQuestionBlock } from '@/components/contentBlocks/CommunityQuestion/CommunityQuestion.schema';
import { CTABannerBlock } from '@/components/contentBlocks/CTABanner/CTABanner.schema';
import { EventTeaserBlock } from '@/components/contentBlocks/EventTeaser/EventTeaser.schema';
import { FaqAccordionBlock } from '@/components/contentBlocks/FaqAccordion/FaqAccordion.schema';
import { FeatureCardsBlock } from '@/components/contentBlocks/FeatureCards/FeatureCards.schema';
import { GrowingMediaOnScrollBlock } from '@/components/contentBlocks/GrowingMediaOnScroll/GrowingMediaOnScroll.schema';
import { HeroBlock } from '@/components/contentBlocks/Hero/Hero.schema';
import { HighlightCardsBlock } from '@/components/contentBlocks/HighlightCards/HighlightCards.schema';
import { IntroGridBlock } from '@/components/contentBlocks/IntroGrid/IntroGrid.schema';
import { LogoCloudBlock } from '@/components/contentBlocks/LogoCloud/LogoCloud.schema';
import { MomentListBlock } from '@/components/contentBlocks/MomentList/MomentList.schema';
import { PhotoMosaicBlock } from '@/components/contentBlocks/PhotoMosaic/PhotoMosaic.schema';
import { ProfileCardsBlock } from '@/components/contentBlocks/ProfileCards/ProfileCards.schema';
import { ProofTickerBlock } from '@/components/contentBlocks/ProofTicker/ProofTicker.schema';
import { ProseBlock } from '@/components/contentBlocks/Prose/Prose.schema';
import { ReviewsBlock } from '@/components/contentBlocks/Reviews/Reviews.schema';
import { ShowreelBlock } from '@/components/contentBlocks/Showreel/Showreel.schema';
import { SpotlightQuoteBlock } from '@/components/contentBlocks/SpotlightQuote/SpotlightQuote.schema';
import { StatBandBlock } from '@/components/contentBlocks/StatBand/StatBand.schema';
import { StepsBlock } from '@/components/contentBlocks/Steps/Steps.schema';
import { StickyShowcaseBlock } from '@/components/contentBlocks/StickyShowcase/StickyShowcase.schema';
import { SubscribeToNewsletterBlock } from '@/components/contentBlocks/SubscribeToNewsletter/SubscribeToNewsletter.schema';
import { TextMediaBlock } from '@/components/contentBlocks/TextMedia/TextMedia.schema';
import { TitleTextBlock } from '@/components/contentBlocks/TitleText/TitleText.schema';

export const Block = z.discriminatedUnion('type', [
	BentoGridBlock,
	CardGridBlock,
	ChannelBoardBlock,
	ChatPreviewBlock,
	CommunityQuestionBlock,
	CTABannerBlock,
	EventTeaserBlock,
	FaqAccordionBlock,
	FeatureCardsBlock,
	GrowingMediaOnScrollBlock,
	HeroBlock,
	HighlightCardsBlock,
	IntroGridBlock,
	LogoCloudBlock,
	MomentListBlock,
	PhotoMosaicBlock,
	ProfileCardsBlock,
	ProofTickerBlock,
	ProseBlock,
	ReviewsBlock,
	ShowreelBlock,
	SpotlightQuoteBlock,
	StatBandBlock,
	StepsBlock,
	StickyShowcaseBlock,
	SubscribeToNewsletterBlock,
	TextMediaBlock,
	TitleTextBlock,
]);
export type Block = z.infer<typeof Block>;
