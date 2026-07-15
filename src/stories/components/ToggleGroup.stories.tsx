import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ToggleGroup from '@/components/components/ToggleGroup';
import { ToggleGroupProps } from '@/lib/content/schema/components/toggleGroup';

const meta: Meta<typeof ToggleGroup> = {
	title: 'Components/ToggleGroup',
	component: ToggleGroup,
	parameters: {
		jsonSchema: { schema: ToggleGroupProps },
		docs: {
			description: {
				component:
					'A set of pressed-button toggles: a segmented control, view switcher or filter-chip row. Each item is a real `<button>` exposing aria-pressed (a set of toggle buttons, not a radiogroup), with roving-tabindex Arrow/Home/End focus that loops by default. Use required for a single-select segmented control that stays filled. The group needs an aria-label.',
			},
		},
	},
	argTypes: {
		multiple: { control: 'boolean' },
		required: { control: 'boolean' },
		loop: { control: 'boolean' },
		segmented: { control: 'boolean' },
		disabled: { control: 'boolean' },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
	},
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
	args: {
		'aria-label': 'View density',
		items: [
			{ value: 'list', label: 'List' },
			{ value: 'grid', label: 'Grid' },
			{ value: 'compact', label: 'Compact' },
		],
		defaultValue: ['grid'],
	},
};

export const Segmented: Story = {
	...Default,
	args: { ...Default.args, segmented: true, required: true },
};

export const Multiple: Story = {
	...Default,
	args: {
		...Default.args,
		'aria-label': 'Text formatting',
		multiple: true,
		defaultValue: ['bold'],
		items: [
			{ value: 'bold', label: 'B' },
			{ value: 'italic', label: 'I' },
			{ value: 'underline', label: 'U' },
		],
	},
};

export const FilterChips: Story = {
	...Default,
	args: {
		...Default.args,
		'aria-label': 'Filter by genre',
		multiple: true,
		defaultValue: ['shonen'],
		items: [
			{ value: 'shonen', label: 'Shonen' },
			{ value: 'seinen', label: 'Seinen' },
			{ value: 'slice-of-life', label: 'Slice of life' },
			{ value: 'mecha', label: 'Mecha' },
		],
	},
};

export const WithIcons: Story = {
	...Default,
	args: {
		...Default.args,
		'aria-label': 'Alignment',
		segmented: true,
		required: true,
		defaultValue: ['left'],
		items: [
			{ value: 'left', icon: 'align-left', ariaLabel: 'Align left' },
			{ value: 'center', icon: 'align-center', ariaLabel: 'Align center' },
			{ value: 'right', icon: 'align-right', ariaLabel: 'Align right' },
		],
	},
};

export const Vertical: Story = {
	...Default,
	args: {
		...Default.args,
		orientation: 'vertical'
	}
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true
	}
};
