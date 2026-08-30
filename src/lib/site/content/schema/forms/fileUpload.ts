import type { Ref } from 'react';
import { z } from 'zod';

export const FileUploadProps = z
	.object({
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		accept: z.string().optional().describe('Accepted file types, e.g. \'image/*,.pdf\''),
		multiple: z.boolean().optional().describe('Allow picking more than one file; defaults to false'),
		maxSize: z.number().optional().describe('Reject files larger than this many bytes (enforced on both the picker and drag-drop)'),
		maxFiles: z.number().optional().describe('Caps how many files are kept from a multi-select or drop; extras are rejected'),
		busy: z.boolean().optional().describe('A submit/processing is in flight — dims the dropzone and blocks new drops; defaults to false'),
		showFileList: z.boolean().optional().describe('Show the picked-file list under the dropzone; defaults to true'),
		label: z.string().optional().describe('Prompt shown inside the dropzone; defaults to \'Drop files here or click to browse\''),
		hint: z.string().optional().describe('Helper text under the prompt (formats, size limits)'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control; defaults to false'),
		onFiles: z.custom<(files: File[]) => void>().optional().describe('Fires with the accepted files whenever the selection changes'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible label'),
		className: z.string().optional().describe('Additional classes on the root element'),
		ref: z.custom<Ref<HTMLInputElement>>().optional().describe('Ref to the underlying <input type="file">'),
	})
	.meta({ title: 'FileUpload' });
export type FileUploadProps = z.infer<typeof FileUploadProps>;
