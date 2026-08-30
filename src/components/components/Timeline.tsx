import Actions from '@/components/basics/Actions';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { TimelineProps as TimelineSchemaProps } from '@/lib/site/content/schema/components/timeline';

type TimelineProps = TimelineSchemaProps;

const Timeline = ({
	items,
	align = 'alternating',
	headingLevel = 3,
	className,
}: TimelineProps) => {
	return (
		<ol className={classNames('timeline', `is-${align}`, className)}>
			{items.map((item, index) => {
				return (
					<li
						className={classNames('timeline-milestone', index % 2 === 1 && 'is-odd')}
						key={`${item.year}-${index}`}
						>
							<div className="timeline-marker" aria-hidden="true">
								<span className="timeline-dot" />
							</div>

							<div className="timeline-entry">
								<Content element="p" className="timeline-year" value={item.year} />

								<div className="timeline-card">
									{item.tagline && <Content element="p" className="timeline-tagline" value={item.tagline} />}
									<Title element={`h${headingLevel}`} size={headingLevel} value={item.title} />
									{item.date && <Content element="p" className="timeline-date" value={item.date} />}
									{item.value && <Content size="small" value={item.value} />}
									{item.media && <Media {...item.media} className="timeline-thumb" />}

									{item.actions && <Actions actions={item.actions} defaultVariant="primary" />}
								</div>
							</div>
						</li>
					);
				})}
			</ol>
	);
};

export default Timeline;
