// Joins truthy class names with a space and drops falsy entries, so conditional classes read as
// `classNames('base', isActive && 'is-active', className)`.
export const classNames = (...classes: Array<string | false | null | undefined>): string => {
	return classes.filter(Boolean).join(' ');
};
