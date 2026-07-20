import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Bell,
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
	Filter,
	Heart,
	Home,
	Info,
	Link,
	List,
	LogOut,
	Mail,
	MapPin,
	Menu,
	Minus,
	Moon,
	Pencil,
	Play,
	Plus,
	Repeat,
	Search,
	Settings,
	Star,
	Trash2,
	TriangleAlert,
	Upload,
	User,
	Users,
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
	bell: Bell,
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
	filter: Filter,
	heart: Heart,
	home: Home,
	info: Info,
	link: Link,
	list: List,
	logout: LogOut,
	mail: Mail,
	'map-pin': MapPin,
	menu: Menu,
	minus: Minus,
	moon: Moon,
	play: Play,
	plus: Plus,
	search: Search,
	settings: Settings,
	star: Star,
	swap: Repeat,
	success: CircleCheck,
	trash: Trash2,
	upload: Upload,
	user: User,
	users: Users,
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
