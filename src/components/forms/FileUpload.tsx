'use client';

import { useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Spinner from '@/components/basics/Spinner';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { FileUploadProps as FileUploadSchemaProps } from '@/lib/site/content/schema/forms/fileUpload';

type FileUploadProps = FileUploadSchemaProps;

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
	ariaLabel,
	className,
	ref,
}: FileUploadProps) => {
	const { haptic } = useHaptics();
	const inputId = useId();
	const localRef = useRef<HTMLInputElement>(null);
	const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? localRef;
	const [files, setFiles] = useState<File[]>([]);
	const [rejected, setRejected] = useState<string[]>([]);
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

	// preventDefault is what makes the label a valid drop target; the hover state already shows it.
	const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
	};

	return (
		<div className={classNames('file-upload', isBlocked && 'is-disabled', rejected.length > 0 && 'is-invalid', className)}>
			<label
				className="file-upload-dropzone"
				htmlFor={inputId}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{busy ? <Spinner size="s" ariaLabel="Bezig" className="file-upload-glyph-spinner" /> : <Icon name="upload" className="file-upload-glyph" />}
				<span className="content file-upload-prompt">{label}</span>
				{hint && <span className="content file-upload-hint">{hint}</span>}
				<input
					ref={inputRef}
					id={inputId}
					className="file-upload-input"
					type="file"
					name={name}
					accept={accept}
					multiple={multiple}
					disabled={isBlocked}
					onChange={handleChange}
					aria-label={ariaLabel}
				/>
			</label>

			{rejected.length > 0 && (
				<p className="file-upload-rejected" role="alert">
					Niet toegestaan: {rejected.join(', ')}
				</p>
			)}

			{showFileList && files.length > 0 && (
				<ul className="file-upload-files">
					{files.map((file) => (
						<li key={`${file.name}-${file.size}`} className="file-upload-file">
							<Icon name="file" />
							<Content element="span" className="file-upload-file-name" value={file.name} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default FileUpload;
