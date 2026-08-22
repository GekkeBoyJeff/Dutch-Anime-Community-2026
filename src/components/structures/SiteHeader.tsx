'use client';

import { usePathname } from 'next/navigation';
import { useState, type Ref } from 'react';

import Button from '@/components/basics/Button';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/classNames';
import type { NavigationProps } from '@/lib/content/schema/structures/navigation';

// The public site header. Separate from Navigation, which carries the dashboard's mega-menus, user
// chip and permission checks — none of which a visitor ever sees. One bar: brand, links, one action.
const SiteHeader = ({ items = [], cta, brand, className, ref }: NavigationProps & { ref?: Ref<HTMLElement> }) => {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	// Home only matches itself; every path starts with '/'.
	const isActive = (url: string, exact?: boolean) =>
		exact || url === '/' ? pathname === url || pathname === `${url}/` : pathname.startsWith(url);

	return (
		<header
			ref={ref}
			className={classNames('site-header', open && 'is-open', className)}
		>
			<div className="site-header-bar">
				<Interactive className="site-header-brand" url="/" derivedAriaLabel={brand?.title ?? 'Home'}>
					{brand?.src && <Media className="site-header-logo" src={brand.src} alt="" mode="fit" />}
					{brand?.title && <span className="site-header-wordmark">{brand.title}</span>}
				</Interactive>

				<nav className="site-header-nav" aria-label="Hoofdmenu">
					<ul>
						{items.map((item) => (
							<li key={item.url} className={classNames(isActive(item.url, item.exact) && 'is-active')}>
								<Interactive className="site-header-link" url={item.url} target={item.target}>
									{item.label}
								</Interactive>
							</li>
						))}
					</ul>
				</nav>

				<div className="site-header-actions">
					{cta && (
						<Button
							className="site-header-cta"
							url={cta.url}
							target={cta.target ?? '_blank'}
							variant={cta.variant ?? 'primary'}
						>
							{cta.label}
						</Button>
					)}
					<button
						type="button"
						className="site-header-toggle"
						aria-expanded={open}
						aria-controls="site-header-panel"
						onClick={() => setOpen((value) => !value)}
					>
						<Icon name={open ? 'close' : 'menu'} />
						<VisuallyHidden>{open ? 'Menu sluiten' : 'Menu openen'}</VisuallyHidden>
					</button>
				</div>
			</div>

			<div className="site-header-panel" id="site-header-panel" hidden={!open}>
				<ul>
					{items.map((item) => (
						<li key={item.url} className={classNames(isActive(item.url, item.exact) && 'is-active')}>
							<Interactive
								className="site-header-panel-link"
								url={item.url}
								target={item.target}
								onClick={() => setOpen(false)}
							>
								{item.icon && <Icon name={item.icon} />}
								{item.label}
							</Interactive>
						</li>
					))}
				</ul>
			</div>
		</header>
	);
};

export default SiteHeader;
