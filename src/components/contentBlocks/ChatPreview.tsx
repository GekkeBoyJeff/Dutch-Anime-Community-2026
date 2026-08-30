import Avatar from '@/components/basics/Avatar';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import type { ChatMessage, ChatPreviewProps as ChatPreviewSchemaProps } from '@/lib/site/content/schema/blocks/chatPreview';

type ChatPreviewProps = ChatPreviewSchemaProps;

const startsTurn = (message: ChatMessage, previous: ChatMessage | undefined) => {
	return !previous || message.author !== previous.author || message.time !== previous.time;
};

const ChatPreview = ({
	channel,
	messages,
	caption,
	colorset,
}: ChatPreviewProps) => {
	return (
		<Section colorset={colorset} className="chat-preview">
			<Container>
				<div className="chat-preview-window">
					<p className="chat-preview-channel">#{channel}</p>

					<ol className="chat-preview-messages">
						{messages.map((message, index) => {
							const opensTurn = startsTurn(message, messages[index - 1]);

							return (
								<li key={message.id} className="chat-preview-message" data-opens-turn={opensTurn || undefined}>
									<span className="chat-preview-avatar">
										{opensTurn && <Avatar size="s" initials={message.author.slice(0, 1).toUpperCase()} />}
									</span>

									<span className="chat-preview-body">
										{opensTurn && (
											<span className="chat-preview-meta">
												<span className="chat-preview-author">{message.author}</span>
												<span className="chat-preview-time">{message.time}</span>
											</span>
										)}
										<Content element="span" className="chat-preview-text" value={message.value} />
									</span>
								</li>
							);
						})}
					</ol>
				</div>

				<Content element="p" className="chat-preview-caption" value={caption} />
			</Container>
		</Section>
	);
};

export default ChatPreview;
