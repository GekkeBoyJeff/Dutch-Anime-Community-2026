import AnnouncementDismiss from '@/components/structures/AnnouncementDismiss';
import type { AnnouncementBarProps as AnnouncementBarSchemaProps, AnnouncementVariant } from '@/lib/site/content/schema/structures/announcementBar';

export type { AnnouncementVariant };

type AnnouncementBarProps = AnnouncementBarSchemaProps;

const AnnouncementBar = ({
	message,
	cta,
	dismissible = true,
	variant = 'info',
	id,
	className,
}: AnnouncementBarProps) => {
	return (
		<AnnouncementDismiss
			message={message}
			cta={cta}
			id={id}
			variant={variant}
			dismissible={dismissible}
			className={className}
		/>
	);
};

export default AnnouncementBar;
