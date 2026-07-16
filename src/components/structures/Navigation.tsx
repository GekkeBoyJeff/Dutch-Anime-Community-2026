'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import useOverlay from '@/hooks/useOverlay';
import { classNames } from '@/lib/classNames';
import type { NavCta as NavCtaSchema, NavigationProps as NavigationSchemaProps, NavItem as NavItemSchema } from '@/lib/content/schema/structures/navigation';

export type NavItem = NavItemSchema;

export type NavCta = NavCtaSchema;

type NavigationProps = NavigationSchemaProps;

// A nav item is active on its exact route and on any route nested below it (so /blog stays lit on
// /blog/post). Home ('/') matches only its exact path; external and anchor links never light up.
const isActivePath = (pathname: string, url: string, exact = false): boolean => {
	if (!url.startsWith('/')) {
		return false;
	}
	if (exact || url === '/') {
		return pathname === url;
	}
	return pathname === url || pathname.startsWith(`${url}/`);
};

// Site header: a floating pill nav with a sliding tracker that marks the active link by inverting
// whatever sits beneath it, a brand roundel, and a CTA tab carved into the page frame's top-right
// corner with concave corner cutouts. On small screens the pill holds a menu toggle that opens a
// full-screen overlay. Drive items/cta/brand from structures.ts — nothing is hardcoded.
const Navigation = ({ items = [], cta, brand, className, ref }: NavigationProps & { ref?: Ref<HTMLElement> }) => {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const [seenPath, setSeenPath] = useState(pathname);
	const listRef = useRef<HTMLUListElement | null>(null);
	const rootRef = useRef<HTMLElement | null>(null);
	const [tracker, setTracker] = useState<{ x: number; width: number } | null>(null);

	// Close the overlay when the route changes so the new page is visible. Adjusting state during
	// render (React's reset-on-prop-change pattern) avoids an effect + cascading render.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setOpen(false);
	}

	useOverlay(open, () => setOpen(false));

	// The page scrolls inside .page-frame, not the window, so Next's own scroll reset never reaches
	// it; scroll the frame back to the top on every navigation (window fallback covers Storybook).
	// Layout effect, not effect, so the scroll lands before the new page paints.
	useLayoutEffect(() => {
		const frame = rootRef.current?.closest('.page-frame-scroll');
		(frame ?? window).scrollTo({ top: 0, left: 0, behavior: 'instant' });
	}, [pathname]);

	// While the full-screen overlay is open, keep keyboard focus inside the header (toggle, CTA tab
	// and overlay links are all visible above it); restore focus to the trigger on close. The page
	// behind the overlay stays in the DOM but is unreachable by Tab, matching what the eye sees.
	// Focus-trap pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
	useEffect(() => {
		const root = rootRef.current;
		if (!open || !root) {
			return;
		}

		const previous = document.activeElement as HTMLElement | null;
		root.querySelector<HTMLElement>('.navigation-overlay a')?.focus();

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab') {
				return;
			}

			const focusables = Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
				(element) => element.offsetParent !== null,
			);
			if (focusables.length === 0) {
				return;
			}

			const first = focusables[0] as HTMLElement;
			const last = focusables[focusables.length - 1] as HTMLElement;
			const active = document.activeElement;

			if (event.shiftKey && (active === first || !root.contains(active))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || !root.contains(active))) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			previous?.focus();
		};
	}, [open]);

	// The tracker is measured, not styled per item: it takes the active item's box so it can slide
	// between differently sized labels. Re-measured on route change, resize and once fonts settle.
	const measure = useCallback(() => {
		const list = listRef.current;
		if (!list) {
			return;
		}

		const active = list.querySelector<HTMLElement>('li.is-active');
		if (!active) {
			setTracker(null);
			return;
		}

		const listBox = list.getBoundingClientRect();
		const box = active.getBoundingClientRect();
		setTracker({ x: box.left - listBox.left, width: box.width });
	}, []);

	// Layout effect: measuring before paint lets the tracker start sliding to the new active item in
	// the same frame the page swaps, instead of lagging a frame behind.
	useLayoutEffect(() => {
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [measure, pathname]);

	useEffect(() => {
		document.fonts?.ready.then(measure);
	}, [measure]);

	return (
		<header
			ref={(element) => {
				rootRef.current = element;
				if (typeof ref === 'function') {
					ref(element);
				} else if (ref) {
					ref.current = element;
				}
			}}
			className={classNames('navigation', open && 'is-open', className)}
		>
			<div className="navigation-bar">
				<Interactive url="/" className="navigation-brand" aria-label={brand?.title ?? 'Home'}>
					{brand?.src && <Media variant="plain" type="image" src={brand.src} alt="" width={48} height={48} className="navigation-logo" />}
					{brand?.title && <Content element="span" className="navigation-wordmark" value={brand.title} />}
				</Interactive>

				<nav className="navigation-pill" aria-label="Primary">
					<Interactive
						className="navigation-toggle"
						aria-expanded={open}
						aria-label={open ? 'Sluit menu' : 'Open menu'}
						onClick={() => setOpen(!open)}
					>
						<span className="navigation-bars" aria-hidden="true" />
						<span className="navigation-toggle-label">Menu</span>
					</Interactive>

					{items.length > 0 && (
						<div className="navigation-links">
							<span
								className="navigation-tracker"
								aria-hidden="true"
								data-visible={tracker ? 'true' : undefined}
								style={tracker ? { transform: `translateX(${tracker.x}px)`, width: `${tracker.width}px` } : undefined}
							/>
							<ul ref={listRef}>
								{items.map((item) => {
									const active = isActivePath(pathname, item.url, item.exact);
									return (
										<li key={item.url} className={active ? 'is-active' : undefined}>
											<Interactive
												url={item.url}
												target={item.target}
												className="navigation-link"
												aria-current={active ? 'page' : undefined}
											>
												{item.label}
											</Interactive>
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</nav>
			</div>

			{cta && (
				<div className="navigation-cta-tab">
					<span className="corner is-scoop-bl is-start" aria-hidden="true" />
					<Button url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'} className="navigation-cta">
						{cta.label}
					</Button>
					<span className="corner is-scoop-bl is-end" aria-hidden="true" />
				</div>
			)}

			{items.length > 0 && (
				<>
					<div className="navigation-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
					<div className="navigation-overlay" aria-hidden={!open} inert={!open}>
						<nav aria-label="Mobile">
							<ul>
								{items.map((item, index) => {
									const active = isActivePath(pathname, item.url, item.exact);
									return (
										<li
											key={item.url}
											className={active ? 'is-active' : undefined}
											style={{ '--index': index } as React.CSSProperties}
										>
											<Interactive
												url={item.url}
												target={item.target}
												onClick={() => setOpen(false)}
												className="navigation-overlay-link"
												aria-current={active ? 'page' : undefined}
											>
												{item.icon && <Icon name={item.icon} />}
												{item.label}
											</Interactive>
										</li>
									);
								})}
							</ul>

							{cta && (
								<Button
									url={cta.url}
									target={cta.target ?? '_blank'}
									variant={cta.variant ?? 'primary'}
									className="navigation-overlay-cta"
									onClick={() => setOpen(false)}
								>
									{cta.label}
								</Button>
							)}
						</nav>
					</div>
				</>
			)}
		</header>
	);
};

export default Navigation;
