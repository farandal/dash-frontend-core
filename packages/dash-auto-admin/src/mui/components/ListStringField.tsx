import { Chip } from '@mui/material';

import React from 'react';
import invertMap from '../../utils/invertMap';

const ListStringsField = ({
	record,
	source,
	map,
}: {
	record?: any;
	source: string;
	label: string;
	map?: any;
}) => {
	const invertedMap = invertMap(map);
	return (
		<>
			{record[source].map((item: string) => [
				<Chip
					key={item}
					label={invertedMap && invertedMap[item] ? invertedMap[item] : item}
				/>,
				<> </>,
			])}
		</>
	);
};

ListStringsField.defaultProps = { addLabel: true };

export default ListStringsField;
