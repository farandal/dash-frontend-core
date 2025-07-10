import { IconButton } from '@mui/material';
import { FC, useState } from 'react';
import { Upload } from '@mui/icons-material';
import React from 'react';
export interface ISingleImageUploader {
	classNamePrefix?: string;
	currentUrl?: string;
	onChange?:  (file:File) => void
}

const SingleImageUploader:FC<ISingleImageUploader> = (props) => {

	const { classNamePrefix = 'default', currentUrl = 'single-image-uploader', onChange } = props;

	const [localFile, setLocalFile] = useState(null);

	return <div className={`single-image-uploader ${classNamePrefix}-img`}>
		{localFile || currentUrl ? (
			<img src={localFile || currentUrl} alt='' />
		) : (
			<div className={`${classNamePrefix}-icon`}>
				{/*<Image />*/}
			</div>
		)}
		<IconButton
			aria-label='upload image'
			component='label'
			className={`${classNamePrefix}-edit`}
		>
            
            <Upload style={{ opacity: '0.6' }} />
            
			<input
				hidden
				accept='image/*'
				type='file'
				onChange={e => {
												
					setLocalFile(URL.createObjectURL(e.target.files[0]));

					if (onChange) {
						onChange(e.target.files[0]);
					}
													
				}}
			/>
										
			{/*<Edit
				style={{ opacity: '0.6' }}
			/>*/}
		</IconButton>
	</div>;
};

export default SingleImageUploader;