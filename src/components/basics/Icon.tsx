import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Book,
	Calendar,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	Clock,
	Copy,
	Download,
	Ellipsis,
	ExternalLink,
	File,
	Heart,
	Home,
	Info,
	Link,
	List,
	LogOut,
	Mail,
	Menu,
	Minus,
	Moon,
	Pencil,
	Play,
	Plus,
	Search,
	Settings,
	Star,
	Trash2,
	TriangleAlert,
	Upload,
	User,
	X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { IconProps } from '@/lib/content/schema/basics/icon';

// Kebab-case icon name → lucide-react glyph. This is the library's icon set; add a row to support a
// new name. Only the glyphs imported above are bundled (lucide tree-shakes), so the set stays small.
export const ICONS: Record<string, LucideIcon> = {
	'align-center': AlignCenter,
	'align-left': AlignLeft,
	'align-right': AlignRight,
	'arrow-left': ArrowLeft,
	'arrow-right': ArrowRight,
	'arrow-up-right': ArrowUpRight,
	book: Book,
	calendar: Calendar,
	check: Check,
	'chevron-down': ChevronDown,
	'chevron-left': ChevronLeft,
	'chevron-right': ChevronRight,
	'chevron-up': ChevronUp,
	clock: Clock,
	close: X,
	copy: Copy,
	dots: Ellipsis,
	download: Download,
	edit: Pencil,
	error: CircleAlert,
	external: ExternalLink,
	file: File,
	heart: Heart,
	home: Home,
	info: Info,
	link: Link,
	list: List,
	logout: LogOut,
	mail: Mail,
	menu: Menu,
	minus: Minus,
	moon: Moon,
	play: Play,
	plus: Plus,
	search: Search,
	settings: Settings,
	star: Star,
	success: CircleCheck,
	trash: Trash2,
	upload: Upload,
	user: User,
	warning: TriangleAlert,
};

// Renders a single icon glyph by name via lucide-react. aria-hidden, because an icon is decorative —
// the accessible label belongs on the surrounding interactive component. The SVG inherits the text
// colour (stroke: currentColor) and is sized in `em` (1em by default) so it tracks the font-size.
// An unknown name renders nothing rather than a broken glyph.
const Icon = ({ name, className, ref, ...rest }: IconProps & ComponentPropsWithoutRef<'svg'> & { ref?: Ref<SVGSVGElement> }) => {
	const Glyph = ICONS[name];

	if (!Glyph) {
		return null;
	}

	return <Glyph ref={ref} className={classNames('icon', `icon-${name}`, className)} aria-hidden="true" {...rest} />;
};

export default Icon;
