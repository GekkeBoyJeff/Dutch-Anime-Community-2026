import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FileUpload from '@/components/components/FileUpload';
import { FileUploadProps } from '@/lib/content/schema/components/fileUpload';

const meta: Meta<typeof FileUpload> = {
	title: 'Components/FileUpload',
	component: FileUpload,
	parameters: {
		docs: {
			description: {
				component:
					'A drag-and-drop file picker over a real `<input type="file">`, so files still submit with native forms and the keyboard/screen-reader path is the input itself.',
			},
		},
		jsonSchema: { schema: FileUploadProps },
	},
	argTypes: {
		multiple: { control: 'boolean' },
		disabled: { control: 'boolean' },
		accept: { control: 'text' },
		label: { control: 'text' },
		hint: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
	args: {
		label: 'Drop files here or click to browse',
		hint: 'PNG, JPG or PDF up to 10MB',
	},
};

export const Multiple: Story = {
	...Default,
	args: {
		...Default.args,
		multiple: true
	}
};

export const ImagesOnly: Story = {
	...Default,
	args: { ...Default.args, accept: 'image/*', hint: 'Images only' },
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true
	}
};
