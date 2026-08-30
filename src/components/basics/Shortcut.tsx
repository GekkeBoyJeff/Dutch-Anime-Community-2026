import { Fragment } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { ShortcutProps as ShortcutSchemaProps } from '@/lib/site/content/schema/basics/shortcut';

type ShortcutProps = ShortcutSchemaProps;

const Shortcut = ({
	keys = [],
	separator = '+',
	className,
}: ShortcutProps) => {
	return (
		<kbd className={classNames('shortcut', className)}>
			{keys.map((key, index) => (
				<Fragment key={index}>
					{index > 0 && separator !== '' && (
						<span className="shortcut-separator" aria-hidden="true">
							{separator}
						</span>
					)}
					<kbd className="shortcut-key">{key}</kbd>
				</Fragment>
			))}
		</kbd>
	);
};

export default Shortcut;
