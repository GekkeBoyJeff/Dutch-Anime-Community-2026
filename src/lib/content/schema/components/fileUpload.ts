import { z } from 'zod';

// Props for the FileUpload component: a drag-and-drop file picker over a real <input type="file">,
// so files still participate in native forms and the keyboard/screen-reader path is the input itself.
export const FileUploadProps = z
	.object({
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		accept: z.string().optional().describe('Accepted file types, e.g. \'image/*,.pdf\''),
		multiple: z.boolean().optional().describe('Allow picking more than one file; defaults to false'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control; defaults to false'),
		'aria-label': z.string().optional().describe('Accessible name when there is no visible label'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'FileUpload' });
export type FileUploadProps = z.infer<typeof FileUploadProps>;
