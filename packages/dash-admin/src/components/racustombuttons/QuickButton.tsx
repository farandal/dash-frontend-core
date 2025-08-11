import * as React from 'react';
import { memo } from 'react';
import PropTypes from 'prop-types';

import {
	useResourceContext,
	useRecordContext,
	useRedirect,
	RaRecord,
} from 'react-admin';

import { Button } from '@mui/material';

import { initAxios } from '../../hooks/axios';
import useVirtualHash from '../../hooks/useVirtualHash';
import {DASHAppConstants} from 'dash-constants';

interface Props<RecordType extends RaRecord = any> {
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

// export type IQuickButton<T extends RaRecord> = ShowButtonProps;
export type IQuickButton<RecordType extends RaRecord = any> = ShowButtonProps<RecordType>;

const URL_PREFIX = DASHAppConstants.system.URL_PREFIX;

// avoids using useMemo to get a constant value for the link state
const scrollStates = {
	true: { _scrollToTop: true },
	false: {},
};


const QuickButton = <RecordType extends RaRecord = any>(
	props: IQuickButton<RecordType>,
	children?: JSX.Element,
) => {
	const redirect = useRedirect();
	const axios = initAxios();
	
	const ComponentType = children?.type || Button;
	const componentProps = children?.props || {};

	const {
		//label = 'ra.action.show',
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

	const { setVirtualHash } = useVirtualHash();

	const handleOnClick = () => {
		if (mode === 'destroy') {
			axios.delete(`${resource}/${record.id}`, {
				headers: { 'Content-Type': 'application/json' },
			});
			return false;
		}

		if (navigation === 'virtualhash') {
			const vhash = `${URL_PREFIX}${resource}/${navigate ? navigate(record) : record.id}`;
			setVirtualHash(vhash);
		}

		if (navigation === 'redirect')
			redirect(mode, resource, navigate ? navigate(record) : record.id);
	};

	return (
		<ComponentType
			onClick={handleOnClick}
			state={scrollStates[String(scrollToTop)]}
			{...componentProps}
			{...(rest as any)}
		/>
	);
};

QuickButton.propTypes = {
	icon: PropTypes.element,
	label: PropTypes.string,
	record: PropTypes.any,
	scrollToTop: PropTypes.bool,
	navigate: PropTypes.func,
	navigation: PropTypes.string,
};

export default memo(
	QuickButton,
	(props: ShowButtonProps, nextProps: ShowButtonProps) =>
		props.resource === nextProps.resource &&
		(props.record && nextProps.record
			? props.record.id === nextProps.record.id
			: props.record == nextProps.record) && // eslint-disable-line eqeqeq
		props.label === nextProps.label,
	//&& props.disabled === nextProps.disabled
);
