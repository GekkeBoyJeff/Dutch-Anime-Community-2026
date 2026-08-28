import BentoGrid from '@/components/contentBlocks/BentoGrid';
import CardGrid from '@/components/contentBlocks/CardGrid';
import ChannelBoard from '@/components/contentBlocks/ChannelBoard';
import ChatPreview from '@/components/contentBlocks/ChatPreview';
import CommunityQuestion from '@/components/contentBlocks/CommunityQuestion';
import CTABanner from '@/components/contentBlocks/CTABanner';
import EventTeaser from '@/components/contentBlocks/EventTeaser';
import FaqAccordion from '@/components/contentBlocks/FaqAccordion';
import FeatureCards from '@/components/contentBlocks/FeatureCards';
import GrowingMediaOnScroll from '@/components/contentBlocks/GrowingMediaOnScroll';
import Hero from '@/components/contentBlocks/Hero';
import HighlightCards from '@/components/contentBlocks/HighlightCards';
import IntroGrid from '@/components/contentBlocks/IntroGrid';
import LogoCloud from '@/components/contentBlocks/LogoCloud';
import MomentList from '@/components/contentBlocks/MomentList';
import PhotoMosaic from '@/components/contentBlocks/PhotoMosaic';
import ProfileCards from '@/components/contentBlocks/ProfileCards';
import ProofTicker from '@/components/contentBlocks/ProofTicker';
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
import type { Block } from '@/lib/site/content/schema/blocks';

type BlocksProps = {
	blocks?: Block[];
};

type BlockRenderProps = {
	eager?: boolean;
};

type BlockRenderer<BlockData> = React.ComponentType<BlockData & BlockRenderProps>;

type BlockRenderers = {
	[B in Block as B['type']]: BlockRenderer<Omit<B, 'type' | 'id'>>;
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
	communityQuestion: CommunityQuestion,
	chatPreview: ChatPreview,
	channelBoard: ChannelBoard,
	momentList: MomentList,
	proofTicker: ProofTicker,
};

const Blocks = ({ blocks = [] }: BlocksProps) => {
	return blocks.map(({ type, id, ...props }, index) => {
		const Renderer = REGISTRY[type] as BlockRenderer<typeof props>;

		return <Renderer key={id ?? `${type}-${index}`} {...props} eager={index === 0} />;
	});
};

export default Blocks;
