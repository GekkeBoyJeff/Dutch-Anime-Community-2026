'use client';

import { Slider as BaseSlider } from '@base-ui/react/slider';

import { classNames } from '@/lib/shared/classNames';
import type { SliderProps as SliderSchemaProps } from '@/lib/site/content/schema/forms/slider';

export type SliderProps = SliderSchemaProps;

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
	ariaLabel,
	className,
	ref,
	...rest
}: SliderProps) => {
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
			aria-label={ariaLabel}
		>
			{showValue && <BaseSlider.Value className="slider-value" />}
			<BaseSlider.Control className="slider-control">
				<BaseSlider.Track className="slider-track">
					<BaseSlider.Indicator className="slider-indicator" />
					{Array.from({ length: thumbCount }, (_, index) => (
						<BaseSlider.Thumb key={index} className="slider-thumb" index={index} />
					))}
				</BaseSlider.Track>
			</BaseSlider.Control>
		</BaseSlider.Root>
	);
};

export default Slider;
