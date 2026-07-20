import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fireEvent, userEvent } from 'storybook/test';

import FileUpload from '@/components/components/FileUpload';
import { FileUploadProps } from '@/lib/content/schema/components/fileUpload';

const meta: Meta<typeof FileUpload> = {
	title: 'Components/FileUpload',
	component: FileUpload,
	parameters: {
		docs: {
			description: {
				component:
					'A drag-and-drop file picker over a real `<input type="file">`, so files still submit with native forms and the keyboard/screen-reader path is the input itself. The one dropzone component in the app — Uploader (media library) and TicketUpload (moderation) both build on this instead of their own react-dropzone wiring.',
			},
		},
		jsonSchema: { schema: FileUploadProps },
	},
	argTypes: {
		multiple: { control: 'boolean' },
		disabled: { control: 'boolean' },
		busy: { control: 'boolean' },
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

export const DragActive: Story = {
	name: 'Drag-active',
	args: { ...Default.args },
	play: async ({ canvasElement }) => {
		fireEvent.dragOver(canvasElement.querySelector('label.dropzone')!);
	},
};

export const Busy: Story = {
	args: { ...Default.args, busy: true },
};

export const RejectedType: Story = {
	name: 'Afgekeurd type',
	args: { ...Default.args, accept: 'image/*', hint: 'Images only' },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(['not an image'], 'transcript.txt', { type: 'text/plain' });
		await userEvent.upload(input, file);
	},
};
