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

import { classNames } from '@/lib/shared/classNames';
import type { IconProps as IconSchemaProps } from '@/lib/site/content/schema/basics/icon';

type IconProps = IconSchemaProps;

// The explicit imports above are what keeps lucide tree-shakeable; a dynamic lookup bundles every glyph.
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

const Icon = ({
	name,
	className,
}: IconProps) => {
	const Glyph = ICONS[name];

	if (!Glyph) {
		return null;
	}

	return <Glyph className={classNames('icon', `icon-${name}`, className)} aria-hidden="true" />;
};

export default Icon;
