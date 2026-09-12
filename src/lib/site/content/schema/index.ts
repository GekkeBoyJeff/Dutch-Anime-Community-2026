// The content layer's public surface: the names src/content/* and the Puck editor import by name.
// Everything else is imported from the file that defines it. This list grows when something becomes
// public, not when a component is added.
export { Media, OgImage } from '@/lib/site/content/schema/shared';
export { Block } from '@/lib/site/content/schema/blocks';
export { ReviewItem } from '@/lib/site/content/schema/blocks/reviews';
export { NavItem } from '@/lib/site/content/schema/structures/navigation';
export { SiteStructures } from '@/lib/site/content/schema/structures/site';
export { Page, PageMeta, StructuredDataNode } from '@/lib/site/content/schema/page';
