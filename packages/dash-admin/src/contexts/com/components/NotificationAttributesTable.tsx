
import React, { FC, ReactNode } from 'react';
import DictionaryContext from '../../dictionary/DictionaryContext';

export interface ISimpleAntAttrTable {
	tableData: any;
	ignore?: string[];
	include?: string[];
}

const NotificationAttributesTable: FC<ISimpleAntAttrTable> = ({
	tableData,
	ignore,
	include,
}) => {
	const dict = React.useContext(DictionaryContext);

	if (!ignore) ignore = [];
	if (!include) include = [];

	let column = tableData ? Object.keys(tableData) : [];
	if (include.length) column = column.filter((key) => include.includes(key));
	if (ignore.length) column = column.filter((key) => !ignore.includes(key));

	const TDData = (): JSX.Element | JSX.Element[] => {
		return column && column.length > 0 ? (
			column.map((attr) => {
				return (
					<tr>
						<td>{dict.get(attr)}</td>
						<td>
							{typeof tableData[attr] !== 'object'
								? dict.get(tableData[attr])
								: tableData[attr]}
						</td>
					</tr>
				);
			})
		) : (
			<></>
		);
	};

	return (
		<table className='table'>
			<tbody>
				<TDData />
			</tbody>
		</table>
	);
};

export default NotificationAttributesTable;
