import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Link from '@/components/basics/Link';
import { classNames } from '@/lib/classNames';
import type { FooterProps as FooterSchemaProps } from '@/lib/content/schema/structures/footer';

type FooterProps = FooterSchemaProps;

// Generalised site footer: a brand block, link columns, social row, and a legal bar with the
// copyright year (computed server-side, so it is always current without client JS). Every piece of
// content is a prop sourced from site.ts — nothing about a specific site is baked in here.
const Footer = ({
	navColumns = [],
	socialLinks = [],
	brand,
	legalLinks = [],
	credit,
	decorated = false,
	className,
	ref,
}: FooterProps & { ref?: Ref<HTMLElement> }) => {
	const year = new Date().getFullYear();

	return (
		<footer ref={ref} className={classNames('footer', decorated && 'is-decorated', className)}>
			<Container className="footer-inner">
				<div className="footer-top">
					{brand && (
						<div className="footer-brand">
							<Content element="p" className="title" value={brand.title} />
							{brand.tagline && <Content element="p" className="footer-tagline" value={brand.tagline} />}

							{socialLinks.length > 0 && (
								<ul className="footer-social">
									{socialLinks.map((social) => (
										<li key={social.url}>
											<Interactive url={social.url} className="footer-social-link" aria-label={social.label}>
												{social.icon ? <Icon name={social.icon} className='footer-social-icon' /> : social.label}
											</Interactive>
										</li>
									))}
								</ul>
							)}
						</div>
					)}

					{navColumns.length > 0 && (
						<nav className="footer-columns" aria-label="Footer">
							{navColumns.map((column) => (
								<div key={column.heading} className="footer-column">
									<Content element="p" className="footer-heading" value={column.heading} />
									<ul>
										{column.links.map((link) => (
											<li key={link.url}>
												<Link url={link.url}>{link.label}</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					)}
				</div>

				<div className="footer-legal">
					<Content element="p" className="footer-copyright">
						&copy; {year} {brand?.title}
						{credit && <Content element="span" className="footer-credit"> · {credit}</Content>}
					</Content>

					{legalLinks.length > 0 && (
						<ul className="footer-legal-links">
							{legalLinks.map((link) => (
								<li key={link.url}>
									<Link url={link.url}>{link.label}</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</Container>
		</footer>
	);
};

export default Footer;
