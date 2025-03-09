import {  Pagination, PaginationProps } from 'react-admin';
import { FC } from 'react';
import React from 'react';

const PaginationComponent:FC<PaginationProps> = (props) => 
		<div
			className='dash-pagination-component'
		>
			<Pagination
				rowsPerPageOptions={[10,25, 50, 100, 250, 500, 1000]}
				{...props}
			/>
		</div>

export default PaginationComponent;
