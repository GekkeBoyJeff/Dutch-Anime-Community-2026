// The content contract — the single source of truth for what valid content is. Internal modules
// (accessors, validation) import the contract from here; external consumers import from @/lib/content.
export * from '@/lib/content/schema/primitives';
export * from '@/lib/content/schema/basics';
export * from '@/lib/content/schema/blocks';
export * from '@/lib/content/schema/components';
export * from '@/lib/content/schema/forms';
export * from '@/lib/content/schema/structures';
export * from '@/lib/content/schema/document';
