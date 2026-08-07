import React, { FC, useContext } from 'react';

import { Pagination, ListContext } from 'react-admin';
import { PaginationProps } from 'react-admin';

// Safe hook that doesn't throw when context is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSafeListContext = (): any => {
	const context = useContext(ListContext);
	return context ?? null;
};

const ExtendedPagination:FC<PaginationProps> = (props) => {
	const list = useSafeListContext();
	return list && list.total > list.perPage ? (
		// @ts-ignore - pageSizeOptions prop compatibility
		(<Pagination pageSizeOptions={[25, 50, 100, 250, 500, 1000]} {...props} />)
	) : (
		<></>
	);
};

export default ExtendedPagination;
