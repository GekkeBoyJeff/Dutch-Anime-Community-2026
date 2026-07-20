'use client';

import { useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Spinner from '@/components/basics/Spinner';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { FileUploadProps as FileUploadSchemaProps } from '@/lib/content/schema/components/fileUpload';

export type FileUploadProps = FileUploadSchemaProps & {
	/** Prompt shown inside the dropzone */
	label?: ReactNode;
	/** Helper text under the prompt (formats, size limits) */
	hint?: ReactNode;
	/** Reject files larger than this many bytes (enforced on both the picker and drag-drop) */
	maxSize?: number;
	/** Caps how many files are kept from a multi-select or drop; extras are rejected */
	maxFiles?: number;
	/** A submit/processing is in flight — dims the dropzone and blocks new drops */
	busy?: boolean;
	/** Show the picked-file list under the dropzone; off when the caller renders its own result list */
	showFileList?: boolean;
	/** Fires with the accepted files whenever the selection changes */
	onFiles?: (files: File[]) => void;
};

// A drag-and-drop file picker over a real <input type="file">, so files still participate in native
// forms and the keyboard/screen-reader path is the input itself. A small client island: it tracks the
// drag-over state and the chosen list, and mirrors files into the hidden input for submission.
const FileUpload = ({
	name,
	accept,
	multiple = false,
	disabled = false,
	maxSize,
	maxFiles,
	busy = false,
	label = 'Drop files here or click to browse',
	hint,
	showFileList = true,
	onFiles,
	className,
	ref,
	...rest
}: FileUploadProps & { ref?: Ref<HTMLInputElement> }) => {
	const { haptic } = useHaptics();
	const inputId = useId();
	const localRef = useRef<HTMLInputElement>(null);
	const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? localRef;
	const [files, setFiles] = useState<File[]>([]);
	const [rejected, setRejected] = useState<string[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const isBlocked = disabled || busy;

	// Enforce accept + maxSize on BOTH the picker and drag-drop — native `accept` doesn't cover drops.
	const accepts = (file: File): boolean => {
		if (maxSize && file.size > maxSize) return false;
		if (!accept) return true;
		const patterns = accept.split(',').map((pattern) => pattern.trim().toLowerCase());
		const type = file.type.toLowerCase();
		const ext = `.${(file.name.split('.').pop() ?? '').toLowerCase()}`;
		return patterns.some((pattern) => pattern === type || pattern === ext || (pattern.endsWith('/*') && type.startsWith(pattern.slice(0, -1))));
	};

	const commit = (list: FileList | null) => {
		const candidates = list ? Array.from(list) : [];
		const accepted = candidates.filter(accepts);
		const capped = maxFiles ? accepted.slice(0, maxFiles) : accepted;
		setFiles(capped);
		setRejected(candidates.filter((file) => !capped.includes(file)).map((file) => file.name));
		onFiles?.(capped);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		commit(event.target.files);
	};

	const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);

		if (isBlocked) {
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

		if (!isBlocked) {
			setIsDragging(true);
		}
	};

	return (
		<div className={classNames('file-upload', isBlocked && 'is-disabled', className)}>
			<label
				className={classNames('dropzone', isDragging && 'is-dragging')}
				htmlFor={inputId}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={() => setIsDragging(false)}
			>
				{busy ? <Spinner size="s" label="Bezig" className="glyph-spinner" /> : <Icon name="upload" className="glyph" />}
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
					disabled={isBlocked}
					onChange={handleChange}
					{...rest}
				/>
			</label>

			{rejected.length > 0 && (
				<p className="rejected" role="alert">
					Niet toegestaan: {rejected.join(', ')}
				</p>
			)}

			{showFileList && files.length > 0 && (
				<ul className="files">
					{files.map((file) => (
						<li key={`${file.name}-${file.size}`} className="file">
							<Icon name="file" />
							<Content element="span" className="file-name" value={file.name} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default FileUpload;
