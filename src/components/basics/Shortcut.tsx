import { Fragment } from 'react';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ShortcutProps } from '@/lib/content/schema/basics/shortcut';

type Props = ShortcutProps & {
	/** A single key as children (alternative to `keys`) */
	children?: ReactNode;
};

// A keyboard shortcut hint: one or more `<kbd>` keys joined by a separator. Nesting `<kbd>` inside a
// `<kbd>` is the HTML spec's own way to mark up a key combination, so a combo stays semantic. Pass
// `keys` for a combo (`['⌘','K']`) or a single key via children; pairs with SearchPalette / useHotkey.
const Shortcut = ({
	keys,
	separator = '+',
	className,
	children,
	ref,
}: Props & { ref?: Ref<HTMLElement> }) => {
	const list: ReactNode[] = keys && keys.length > 0 ? keys : children != null ? [children] : [];

	return (
		<kbd ref={ref} className={classNames('shortcut', className)}>
			{list.map((key, index) => (
				<Fragment key={index}>
					{index > 0 && separator !== '' && (
						<span className="separator" aria-hidden="true">
							{separator}
						</span>
					)}
					<kbd className="key">{key}</kbd>
				</Fragment>
			))}
		</kbd>
	);
};

export default Shortcut;
