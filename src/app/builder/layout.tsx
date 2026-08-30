import type { ReactNode } from 'react';

type BuilderLayoutProps = { children: ReactNode };

// No .page-frame-scroll wrapper: the editor is fixed-height, not scrolled.
const BuilderLayout = ({ children }: BuilderLayoutProps) => {
	return <div className="page-frame">{children}</div>;
};

export default BuilderLayout;
