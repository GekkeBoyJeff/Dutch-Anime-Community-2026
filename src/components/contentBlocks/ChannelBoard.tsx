import Badge from '@/components/basics/Badge';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import type { ChannelBoardProps as ChannelBoardSchemaProps } from '@/lib/site/content/schema/blocks/channelBoard';

type ChannelBoardProps = ChannelBoardSchemaProps;

// The rooms of the server, named and explained. Nothing links out: a channel URL only works once you
// are a member, so for everyone this block is written for it would be a link that always fails.
const ChannelBoard = ({
	heading,
	items = [],
	colorset,
}: ChannelBoardProps) => {
	return (
		<Section colorset={colorset} className="channel-board">
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="channel-board-header" />}

				<ul className="channel-board-list">
					{items.map((item) => (
						<li key={item.id} className="channel-board-channel">
							<span className="channel-board-name">#{item.name}</span>
							<Content element="span" className="channel-board-topic" value={item.topic} />
							{item.rhythm && (
								<Badge variant="outline" className="channel-board-rhythm" value={item.rhythm} />
							)}
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default ChannelBoard;
