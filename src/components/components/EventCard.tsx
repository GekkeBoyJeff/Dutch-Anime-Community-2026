import Badge from '@/components/basics/Badge';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import { formatDate } from '@/lib/shared/formatDate';
import type { EventCardProps as EventCardSchemaProps, EventCardTranslations } from '@/lib/site/content/schema/components/eventCard';

export type { EventCardTranslations };

const DEFAULT_TRANSLATIONS: Required<EventCardTranslations> = {
	timeLabel: 'Time',
	locationLabel: 'Location',
};

type EventCardProps = EventCardSchemaProps;

const EventCard = ({
	title,
	value,
	startDate,
	endDate,
	location,
	status,
	statusVariant = 'primary',
	media,
	href,
	translations,
	className,
}: EventCardProps) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };
	const day = startDate ? formatDate(startDate, { day: 'numeric' }) : undefined;
	const month = startDate ? formatDate(startDate, { month: 'short' }) : undefined;
	// A date-only ISO string carries no meaningful time — formatting it would render a bogus "00:00".
	const startTime = startDate?.includes('T') ? formatDate(startDate, { hour: '2-digit', minute: '2-digit' }) : undefined;
	const endTime = endDate?.includes('T') ? formatDate(endDate, { hour: '2-digit', minute: '2-digit' }) : undefined;

	return (
		<article
			className={classNames('card', 'event-card',href && 'is-clickable', media && 'has-media', className)}
		>
			{media && (
				<div className="event-card-media">
					<Media {...media} ratio={media.ratio ?? '16/9'} />
				</div>
			)}

			<div className="event-card-body">
				{(day || month) && (
					<p className="event-card-date" aria-hidden="true">
						{day && <Content element="span" className="event-card-day" value={day} />}
						{month && <Content element="span" className="event-card-month" value={month} />}
					</p>
				)}

				<div className="event-card-detail">
					{status && (
						<Badge variant={statusVariant} value={status} className="event-card-status" />
					)}

					<Title
						element="h3"
						size={4}
						className="event-card-title"
						value={title}
						href={href}
						linkClassName="event-card-link"
					/>

					{value && <Content size="small" className="event-card-summary" value={value} />}

					{(startTime || location) && (
						<dl className="event-card-meta">
							{startTime && (
								<div className="event-card-meta-row">
									<dt className="event-card-meta-label">{t.timeLabel}</dt>
									<dd>
										<time dateTime={startDate}>{startTime}</time>
										{endTime && (
											<>
												<span aria-hidden="true">–</span>
												<time dateTime={endDate}>{endTime}</time>
											</>
										)}
									</dd>
								</div>
							)}

							{location && (
								<div className="event-card-meta-row">
									<dt className="event-card-meta-label">{t.locationLabel}</dt>
									<dd>{location}</dd>
								</div>
							)}
						</dl>
					)}
				</div>
			</div>
		</article>
	);
};

export default EventCard;
