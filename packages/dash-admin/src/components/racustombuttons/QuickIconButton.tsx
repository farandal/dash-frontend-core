import * as React from 'react';
import { memo, ReactElement } from 'react';
import PropTypes from 'prop-types';
import ImageEye from '@mui/icons-material/RemoveRedEye';

import {
	useResourceContext,
	useRecordContext,
	useRedirect,
	RaRecord,
} from 'react-admin';

import { IconButton } from '@mui/material';

import { initAxios } from '../../hooks/axios';
import useVirtualHash from '../../hooks/useVirtualHash';
import {DASHAdminSystemConstants} from 'dash-constants';

//import { IQuickEditButton } from '../dash-auto-admin/src';
const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
interface Props<RecordType extends RaRecord = any> {
	icon?: ReactElement;
	label?: string;
	record?: RecordType;
	resource?: string;
	navigate?: (record: RecordType) => string;
	navigation?: 'redirect' | 'virtualhash';
	mode?: 'show' | 'create' | 'edit' | 'destroy';
	scrollToTop?: boolean;
}

export type ShowButtonProps<RecordType extends RaRecord = any> =
	Props<RecordType> /*& ButtonProps*/;

export type IQuickIconButton<T extends RaRecord> = ShowButtonProps;

const QuickIconButton = <RecordType extends RaRecord = any>(
	props: IQuickIconButton<RecordType>,
) => {
	const redirect = useRedirect();
	const axios = initAxios();

	const {
		icon = defaultIcon,
		label = 'ra.action.show',
		record: recordProp,
		resource: resourceProp,
		navigate: navigate,
		scrollToTop = true,
		navigation = 'redirect',
		mode = 'edit',
		...rest
	} = props;

	const resource = useResourceContext(props);
	const record = useRecordContext(props);

	if (!record) return null;

	const { hash, setVirtualHash } = useVirtualHash();

	const handleOnClick = () => {
		if (mode == 'destroy') {
			axios.delete(`${resource}/${record.id}`, {
				headers: { 'Content-Type': 'application/json' },
			});
			return false;
		}

		if (navigation === 'virtualhash') {
			let vhash = `${URL_PREFIX}${resource}/${navigate ? navigate(record) : record.id}`;
			setVirtualHash(vhash);
		}

		if (navigation === 'redirect')
			redirect(mode, resource, navigate ? navigate(record) : record.id);
	};

	return (
		<IconButton
			onClick={handleOnClick}
			state={scrollStates[String(scrollToTop)]}
			label={label}
			//onClick={stopPropagation}
			{...(rest as any)}
		>
			{icon}
		</IconButton>
	);
};

// avoids using useMemo to get a constant value for the link state
const scrollStates = {
	true: { _scrollToTop: true },
	false: {},
};

const defaultIcon = <ImageEye />;

// useful to prevent click bubbling in a datagrid with rowClick
const stopPropagation = (e) => e.stopPropagation();

QuickIconButton.propTypes = {
	icon: PropTypes.element,
	label: PropTypes.string,
	record: PropTypes.any,
	scrollToTop: PropTypes.bool,
	navigate: PropTypes.func,
	navigation: PropTypes.string,
};


export default  memo(
	QuickIconButton,
	(props: ShowButtonProps, nextProps: ShowButtonProps) =>
		props.resource === nextProps.resource &&
		(props.record && nextProps.record
			? props.record.id === nextProps.record.id
			: props.record == nextProps.record) && // eslint-disable-line eqeqeq
		props.label === nextProps.label,
	//&& props.disabled === nextProps.disabled
);