import type { Ref } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import AnnouncementDismiss from '@/components/structures/AnnouncementDismiss';
import type { AnnouncementBarProps as AnnouncementBarSchemaProps, AnnouncementVariant } from '@/lib/content/schema/structures/announcementBar';

export type { AnnouncementVariant };

type AnnouncementBarProps = AnnouncementBarSchemaProps;

// Dismissible top-of-page banner: a message and an optional CTA. The content is server-rendered; the
// dismiss control and the "stay hidden after closing" logic live in the AnnouncementDismiss island,
// which remembers the choice per id in localStorage. Generic English aria, status-token tints.
const AnnouncementBar = ({
	message,
	cta,
	dismissible = true,
	variant = 'info',
	id,
	className,
	ref,
}: AnnouncementBarProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<AnnouncementDismiss
			ref={ref}
			id={id}
			variant={variant}
			dismissible={dismissible}
			className={className}
		>
			<Content element="p" className="message" value={message} />

			{cta?.label && (
				<Button url={cta.url} target={cta.target} variant={cta.variant ?? 'ghost'} icon={cta.icon} className="cta">
					{cta.label}
				</Button>
			)}
		</AnnouncementDismiss>
	);
};

export default AnnouncementBar;
