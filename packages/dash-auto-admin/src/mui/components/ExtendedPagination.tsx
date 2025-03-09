import React, { FC } from 'react';

import { useListContext, Pagination } from 'react-admin';
import { PaginationProps } from 'react-admin/src';

const ExtendedPagination:FC<PaginationProps> = (props) => {
	const list = useListContext();
	return list.total > list.perPage ? (
		<Pagination rowsPerPageOptions={[25, 50, 100, 250, 500, 1000]} {...props} />
	) : (
		<></>
	);
};

export default ExtendedPagination;
