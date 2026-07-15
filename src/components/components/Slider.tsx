'use client';

import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { SliderProps as SliderSchemaProps } from '@/lib/content/schema/components/slider';

export type SliderProps = SliderSchemaProps & {
	/** Fires while dragging with the new value */
	onValueChange?: (value: number | number[]) => void;
	/** Fires once the value is committed (drag end / key release) */
	onValueCommitted?: (value: number | number[]) => void;
};

// A draggable slider input for picking a number or a min–max range. Wraps Base UI's Slider, which
// renders a real <input type="range"> per thumb and handles arrow/Page/Home/End keys, RTL and the
// aria-value* attributes. A small client island; styled entirely through the part data-attributes.
const Slider = ({
	value,
	defaultValue,
	onValueChange,
	onValueCommitted,
	min = 0,
	max = 100,
	step = 1,
	disabled,
	orientation = 'horizontal',
	name,
	showValue = false,
	className,
	ref,
	...rest
}: SliderProps & { ref?: Ref<HTMLDivElement> }) => {
	// A two-number value means a range, so it gets two thumbs; otherwise a single thumb.
	const thumbCount = Array.isArray(value)
		? value.length
		: Array.isArray(defaultValue)
			? defaultValue.length
			: 1;

	return (
		<BaseSlider.Root
			ref={ref}
			className={classNames('slider', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			onValueCommitted={onValueCommitted}
			min={min}
			max={max}
			step={step}
			disabled={disabled}
			orientation={orientation}
			name={name}
			{...rest}
		>
			{showValue && <BaseSlider.Value className="value" />}
			<BaseSlider.Control className="control">
				<BaseSlider.Track className="track">
					<BaseSlider.Indicator className="indicator" />
					{Array.from({ length: thumbCount }, (_, index) => (
						<BaseSlider.Thumb key={index} className="thumb" index={index} />
					))}
				</BaseSlider.Track>
			</BaseSlider.Control>
		</BaseSlider.Root>
	);
};

export default Slider;
