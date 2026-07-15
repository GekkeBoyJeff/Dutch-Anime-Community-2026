'use client';

import { useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { FileUploadProps as FileUploadSchemaProps } from '@/lib/content/schema/components/fileUpload';

export type FileUploadProps = FileUploadSchemaProps & {
	/** Prompt shown inside the dropzone */
	label?: ReactNode;
	/** Helper text under the prompt (formats, size limits) */
	hint?: ReactNode;
	/** Fires with the chosen FileList whenever the selection changes */
	onFilesChange?: (files: File[]) => void;
};

// A drag-and-drop file picker over a real <input type="file">, so files still participate in native
// forms and the keyboard/screen-reader path is the input itself. A small client island: it tracks
// the drag-over state and the chosen list, and mirrors files into the hidden input for submission.
const FileUpload = ({
	name,
	accept,
	multiple = false,
	disabled = false,
	label = 'Drop files here or click to browse',
	hint,
	onFilesChange,
	className,
	ref,
	...rest
}: FileUploadProps & { ref?: Ref<HTMLInputElement> }) => {
	const { haptic } = useHaptics();
	const inputId = useId();
	const localRef = useRef<HTMLInputElement>(null);
	const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? localRef;
	const [files, setFiles] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	const commit = (list: FileList | null) => {
		const next = list ? Array.from(list) : [];
		setFiles(next);
		onFilesChange?.(next);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		commit(event.target.files);
	};

	const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);

		if (disabled) {
			return;
		}

		// Mirror the dropped files into the real input so a native form submits them.
		if (inputRef.current && event.dataTransfer.files.length > 0) {
			inputRef.current.files = event.dataTransfer.files;
			haptic();
			commit(event.dataTransfer.files);
		}
	};

	const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();

		if (!disabled) {
			setIsDragging(true);
		}
	};

	return (
		<div className={classNames('file-upload', disabled && 'is-disabled', className)}>
			<label
				className={classNames('dropzone', isDragging && 'is-dragging')}
				htmlFor={inputId}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={() => setIsDragging(false)}
			>
				<Icon name="upload" className="glyph" />
				<Content element="span" className="prompt">{label}</Content>
				{hint && <Content element="span" className="hint">{hint}</Content>}
				<input
					ref={inputRef}
					id={inputId}
					className="input"
					type="file"
					name={name}
					accept={accept}
					multiple={multiple}
					disabled={disabled}
					onChange={handleChange}
					{...rest}
				/>
			</label>

			{files.length > 0 && (
				<ul className="files">
					{files.map((file) => (
						<li key={`${file.name}-${file.size}`} className="file">
							<Icon name="file" className='file-upload-addon-icon' />
							<Content element="span" className="file-name" value={file.name} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default FileUpload;
