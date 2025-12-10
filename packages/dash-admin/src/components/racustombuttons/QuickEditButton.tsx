import * as React from 'react';
import { memo, ReactElement } from 'react';
import PropTypes from 'prop-types';
import ImageEye from '@mui/icons-material/RemoveRedEye';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RaRecord } from 'react-admin';
import {
	useResourceContext,
	useRecordContext,
	useCreatePath,
	useRedirect,
} from 'react-admin';

import { Button, ButtonProps } from 'react-admin';
import { Fab, IconButton } from '@mui/material';
import useVirtualHash from '../../hooks/useVirtualHash';
import {DASHAdminSystemConstants} from 'dash-constants';

//import { IQuickEditButton } from '../dash-auto-admin/src';
const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
interface Props<RecordType extends RaRecord = any> {
	icon?: ReactElement;
	label?: string;
	record?: RecordType;
	resource?: string;
	navigate?: (id: number | string) => number | string;
	navigation?: 'redirect' | 'virtualhash';
	mode?: 'show' | 'create' | 'edit';
	scrollToTop?: boolean;
}

export type ShowButtonProps<RecordType extends RaRecord = any> =
	Props<RecordType> & ButtonProps;

export type IQuickEditButton<T extends RaRecord> = ShowButtonProps;

const QuickEditButton = <RecordType extends RaRecord = any>(
	props: IQuickEditButton<RecordType>,
) => {
	const location = useLocation();
	const redirect = useRedirect();

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
	const createPath = useCreatePath();
	if (!record) return null;

	const { hash, setVirtualHash } = useVirtualHash();

	const handleOnClick = React.useCallback(() => {
		if (navigation === 'virtualhash')
			setVirtualHash(`${URL_PREFIX}${resource}/${record.id}/${mode}`);
		if (navigation === 'redirect')
			redirect(mode, resource, navigate ? navigate(record.id) : record.id);
	}, [navigate]);

	return (
		<IconButton
			//component={Link}
			//to={createPath({ type: 'show', resource, id: record.id })}
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

QuickEditButton.propTypes = {
	icon: PropTypes.element,
	label: PropTypes.string,
	record: PropTypes.any,
	scrollToTop: PropTypes.bool,
	navigate: PropTypes.func,
	navigation: PropTypes.string,
};

const PureCustonRaButton = memo(
	QuickEditButton,
	(props: ShowButtonProps, nextProps: ShowButtonProps) =>
		props.resource === nextProps.resource &&
		(props.record && nextProps.record
			? props.record.id === nextProps.record.id
			: props.record == nextProps.record) && // eslint-disable-line eqeqeq
		props.label === nextProps.label &&
		props.disabled === nextProps.disabled,
);

export default PureCustonRaButton;
