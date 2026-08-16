import BentoGrid from '@/components/contentBlocks/BentoGrid';
import CardGrid from '@/components/contentBlocks/CardGrid';
import CTABanner from '@/components/contentBlocks/CTABanner';
import EventTeaser from '@/components/contentBlocks/EventTeaser';
import FaqAccordion from '@/components/contentBlocks/FaqAccordion';
import FeatureCards from '@/components/contentBlocks/FeatureCards';
import GrowingMediaOnScroll from '@/components/contentBlocks/GrowingMediaOnScroll';
import Hero from '@/components/contentBlocks/Hero';
import HighlightCards from '@/components/contentBlocks/HighlightCards';
import IntroGrid from '@/components/contentBlocks/IntroGrid';
import LogoCloud from '@/components/contentBlocks/LogoCloud';
import PhotoMosaic from '@/components/contentBlocks/PhotoMosaic';
import ProfileCards from '@/components/contentBlocks/ProfileCards';
import Prose from '@/components/contentBlocks/Prose';
import Reviews from '@/components/contentBlocks/Reviews';
import Showreel from '@/components/contentBlocks/Showreel';
import SpotlightQuote from '@/components/contentBlocks/SpotlightQuote';
import StatBand from '@/components/contentBlocks/StatBand';
import Steps from '@/components/contentBlocks/Steps';
import StickyShowcase from '@/components/contentBlocks/StickyShowcase';
import SubscribeToNewsletter from '@/components/contentBlocks/SubscribeToNewsletter';
import TextMedia from '@/components/contentBlocks/TextMedia';
import TitleText from '@/components/contentBlocks/TitleText';
import type { Block } from '@/lib/content';

interface BlocksProps {
	/** The block list: each item has a `type` (see REGISTRY) plus its own props */
	blocks?: Block[];
}

// Maps each block type to its renderer. The mapped type ties every key to that block's exact props,
// so a mis-wired entry (e.g. hero → Reviews) is a compile error. One place to wire up a new block.
type BlockRenderers = {
	[B in Block as B['type']]: React.ComponentType<Omit<B, 'type' | 'id'>>;
};

export const REGISTRY: BlockRenderers = {
	hero: Hero,
	cardGrid: CardGrid,
	featureCards: FeatureCards,
	textMedia: TextMedia,
	prose: Prose,
	reviews: Reviews,
	ctaBanner: CTABanner,
	titleText: TitleText,
	introGrid: IntroGrid,
	logoCloud: LogoCloud,
	faqAccordion: FaqAccordion,
	highlightCards: HighlightCards,
	bentoGrid: BentoGrid,
	profileCards: ProfileCards,
	steps: Steps,
	statBand: StatBand,
	stickyShowcase: StickyShowcase,
	photoMosaic: PhotoMosaic,
	spotlightQuote: SpotlightQuote,
	growingMediaOnScroll: GrowingMediaOnScroll,
	showreel: Showreel,
	eventTeaser: EventTeaser,
	subscribeNewsletter: SubscribeToNewsletter,
};

// Renders a page's block list. Every type resolves: REGISTRY is a mapped type over the same Zod union
// the content is validated against, and content that doesn't match that union never gets this far — it
// throws at the accessor. The cast only tells TypeScript that this indexed access and these props
// belong to the same union member.
const Blocks = ({ blocks = [] }: BlocksProps) => {
	return blocks.map(({ type, id, ...props }, index) => {
		const Renderer = REGISTRY[type] as React.ComponentType<typeof props>;

		return <Renderer key={id ?? `${type}-${index}`} {...props} />;
	});
};

export default Blocks;
