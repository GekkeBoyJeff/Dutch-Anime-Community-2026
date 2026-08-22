import { z } from 'zod';

import { Colorset, Id } from '@/lib/content/schema/primitives';

export const ChatMessage = z
	.object({
		id: Id,
		author: z.string().min(1).describe('Who is speaking. A made-up first name — never a real member without their say-so'),
		time: z.string().min(1).describe('Clock time as it would show in the chat, e.g. \'19:04\''),
		text: z.string().min(1).describe('What they say'),
	})
	.meta({ title: 'ChatMessage' });
export type ChatMessage = z.infer<typeof ChatMessage>;

// A rebuilt fragment of a conversation, so a visitor can see what the first minutes look like instead
// of being told. Real markup rather than a screenshot: sharp at any size, readable by a screen reader,
// and it shows nobody's face.
export const ChatPreviewProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		channel: z.string().min(1).describe('Channel name without the #; the block draws that itself'),
		messages: z.array(ChatMessage).min(2).max(6).describe('The exchange, in order. Uneven gaps between times are the point, not a mistake — a quiet stretch shows that a pause is normal'),
		caption: z
			.string()
			.min(1)
			.describe(
				'Required, and it stays required: a conversation with names and times is a claim that it happened. Say what this is, e.g. \'Nagebouwd, met verzonnen namen. Zo loopt het meestal.\'',
			),
	})
	.meta({ title: 'ChatPreview' });
export type ChatPreviewProps = z.infer<typeof ChatPreviewProps>;

// Block = component props plus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const ChatPreviewBlock = ChatPreviewProps.extend({
	type: z.literal('chatPreview'),
	id: Id.optional(),
});
export type ChatPreviewBlock = z.infer<typeof ChatPreviewBlock>;
