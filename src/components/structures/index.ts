// Tier for the page shell (Navigation, Footer, AnnouncementBar, SiteChrome).
// Mounted by the (website) layout through SiteChrome, which reads validated data from
// src/content/structures.ts. SiteChrome composes the other three, so it is exported last (barrel rule).
export { default as Navigation } from '@/components/structures/Navigation';
export { default as MegaMenu } from '@/components/structures/MegaMenu';
export { default as Footer } from '@/components/structures/Footer';
export { default as AnnouncementBar } from '@/components/structures/AnnouncementBar';
export { default as SiteChrome } from '@/components/structures/SiteChrome';
