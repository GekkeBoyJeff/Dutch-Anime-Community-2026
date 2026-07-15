import type { Ref } from 'react';

import Badge from '@/components/basics/Badge';
import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { EventCardProps, EventCardTranslations } from '@/lib/content';
import { formatDate } from '@/lib/formatDate';

export type { EventCardTranslations };

const DEFAULT_TRANSLATIONS: Required<EventCardTranslations> = {
	timeLabel: 'Time',
	locationLabel: 'Location',
};

// Event card: a standout date chip, title, summary, time range and location, plus an optional
// status badge and lead media. A Server Component; whole-card-clickable via a stretched link on the
// title. Dates are formatted SSR-safe so hydration never mismatches.
const EventCard = ({
	title,
	summary,
	startDate,
	endDate,
	location,
	status,
	statusVariant = 'primary',
	media,
	href,
	translations,
	className,
	ref,
}: EventCardProps & { ref?: Ref<HTMLElement> }) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };
	const day = startDate ? formatDate(startDate, { day: 'numeric' }) : undefined;
	const month = startDate ? formatDate(startDate, { month: 'short' }) : undefined;
	// A date-only ISO string carries no meaningful time — formatting it would render a bogus "00:00".
	const startTime = startDate?.includes('T') ? formatDate(startDate, { hour: '2-digit', minute: '2-digit' }) : undefined;
	const endTime = endDate?.includes('T') ? formatDate(endDate, { hour: '2-digit', minute: '2-digit' }) : undefined;

	return (
		<article
			ref={ref}
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
						<Badge variant={statusVariant} className="event-card-status">
							{status}
						</Badge>
					)}

					{href ? (
						<Title element="h3" size={4} className="event-card-title">
							<Interactive url={href} className="event-card-link">
								{title}
							</Interactive>
						</Title>
					) : (
						<Title element="h3" size={4} value={title} className="event-card-title" />
					)}

					{summary && <Content size="small" className="event-card-summary" value={summary} />}

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
