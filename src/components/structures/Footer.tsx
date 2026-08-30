import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Link from '@/components/basics/Link';
import { classNames } from '@/lib/shared/classNames';
import type { FooterProps as FooterSchemaProps } from '@/lib/site/content/schema/structures/footer';

type FooterProps = FooterSchemaProps;

const Footer = ({
	navColumns = [],
	socialLinks = [],
	brand,
	legalLinks = [],
	credit,
	decorated = false,
	className,
}: FooterProps) => {
	const year = new Date().getFullYear();

	return (
		<footer className={classNames('footer', decorated && 'is-decorated', className)}>
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
											<Interactive url={social.url} className="footer-social-link" ariaLabel={social.label}>
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
								<div key={column.title} className="footer-column">
									<Content element="p" className="footer-heading" value={column.title} />
									<ul>
										{column.links.map((link) => (
											<li key={link.url}>
												<Link url={link.url} value={link.value} />
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					)}
				</div>

				<div className="footer-legal">
					<p className="content footer-copyright">
						&copy; {year} {brand?.title}
						{credit && <span className="content footer-credit"> · {credit}</span>}
					</p>

					{legalLinks.length > 0 && (
						<ul className="footer-legal-links">
							{legalLinks.map((link) => (
								<li key={link.url}>
									<Link url={link.url} value={link.value} />
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
