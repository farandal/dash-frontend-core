import { IconButton } from "@mui/material";
import { FC, useState } from "react";
import Edit from "@mui/icons-material/Edit";
import Image from "@mui/icons-material/Image";
import React from "react";

export interface ISingleImageUploader {
	classNamePrefix?: string;
	currentUrl?: string;
	onChange?: (file: File) => void;
	/** Disable drag & drop, leaving only the click-to-browse button. */
	disableDragAndDrop?: boolean;
}

const SingleImageUploader: FC<ISingleImageUploader> = (props) => {
	// NOTE: currentUrl deliberately defaults to undefined, NOT to the string
	// 'single-image-uploader' as it once did — that default was always truthy, so
	// the `<Image />` placeholder branch below could never run and an uploader
	// with no image rendered a broken <img> instead of the icon.
	const {
		classNamePrefix = 'default',
		currentUrl,
		onChange,
		disableDragAndDrop = false,
	} = props;

	const [localFile, setLocalFile] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	/** Shared by the file input and the drop handler. */
	const acceptFile = (file?: File) => {
		// Guard: cancelling the file dialog fires change with an empty list.
		if (!file) return;

		// Dropping a non-image (a PDF, a folder) must not blank the current
		// preview — ignore it and keep whatever is already there.
		if (!file.type?.startsWith('image/')) return;

		setLocalFile(URL.createObjectURL(file));
		onChange?.(file);
	};

	const dragHandlers = disableDragAndDrop
		? {}
		: {
			onDragEnter: (e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(true);
			},
			// Both dragOver AND dragEnter must preventDefault, or the browser
			// navigates away to the dropped file instead of firing onDrop.
			onDragOver: (e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(true);
			},
			onDragLeave: (e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				// Ignore leaves fired by moving over a CHILD element — without
				// this the highlight flickers as the pointer crosses the img.
				if (e.currentTarget.contains(e.relatedTarget as Node)) return;
				setIsDragging(false);
			},
			onDrop: (e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(false);
				acceptFile(e.dataTransfer?.files?.[0]);
			},
		};

	return (
		<div
			className={[
				'single-image-uploader',
				`${classNamePrefix}-img`,
				isDragging ? 'is-dragging' : '',
			].filter(Boolean).join(' ')}
			{...dragHandlers}
		>
			{localFile || currentUrl ? (
				<img src={localFile || currentUrl} alt='' />
			) : (
				<div className={`${classNamePrefix}-icon`}>
					<Image />
				</div>
			)}
			<IconButton
				aria-label='upload image'
				component='label'
				className={`${classNamePrefix}-edit`}
			>
				<input
					hidden
					accept='image/*'
					type='file'
					onChange={e => acceptFile(e.target.files?.[0])}
				/>
				<Edit style={{ opacity: '0.6' }} />
			</IconButton>
		</div>
	);
};

export default SingleImageUploader;
