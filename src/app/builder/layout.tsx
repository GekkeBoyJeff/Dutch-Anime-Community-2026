import type { ReactNode } from 'react';

interface BuilderLayoutProps {
	/** The builder page */
	children?: ReactNode;
}

// The builder sits in the same framed card + mat as the rest of the site (and the dashboard), so the
// editor reads as part of the app instead of a bare full-bleed page. No admin navbar — the editor's own
// top bar handles navigation. Inherits the dac theme/colorset from <html>/<body>, so the frame + mat
// match the public site exactly. No .page-frame-scroll wrapper: the editor is fixed-height, not scrolled.
const BuilderLayout = ({ children }: BuilderLayoutProps) => {
	return <div className="page-frame">{children}</div>;
};

export default BuilderLayout;
