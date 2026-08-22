import type { Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import type { ChatMessage, ChatPreviewProps } from '@/lib/content';

// Someone speaking twice within the same minute is one turn: the second message keeps the text column
// but drops the avatar, the name and the time, the way every chat client does it. A different speaker
// or a later time starts a new turn — otherwise a long silence would vanish when the same person
// picks the conversation back up, and that silence is the whole point of the block.
const startsTurn = (message: ChatMessage, previous: ChatMessage | undefined) => {
	return !previous || message.author !== previous.author || message.time !== previous.time;
};

// A rebuilt fragment of a conversation. Nothing here is interactive on purpose — a mock input box
// invites typing and does nothing, which is the worst kind of dead interface.
const ChatPreview = ({ channel, messages, caption, colorset, ref }: ChatPreviewProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="chat-preview">
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
										<Content element="span" className="chat-preview-text" value={message.text} />
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
