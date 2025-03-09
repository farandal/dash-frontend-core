import * as React from 'react';
import { memo } from 'react';
import PropTypes from 'prop-types';
import DASHAppConstants from 'dash-constants';

import {
	useResourceContext,
	useRecordContext,
	useRedirect,
	RaRecord,
} from 'react-admin';

import { Button } from '@mui/material';

import useVirtualHash from '../../hooks/useVirtualHash';
import IDashAutoAdminResourceConfig from '../../interfaces/IDashAutoAdminResourceConfig';
const URL_PREFIX = DASHAppConstants.system.URL_PREFIX;
/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
interface Props<RecordType extends RaRecord = any> {
	label?: string;
	record?: RecordType;
	resource?: string;
	navigate?: (record?: RecordType) => string;
	navigation?: 'redirect' | 'virtualhash';
	mode: 'show' | 'create' | 'edit' | 'destroy';
	scrollToTop?: boolean;
    resourceConfig?: IDashAutoAdminResourceConfig;
	children?: JSX.Element;
}
/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
export type ShowButtonProps<RecordType extends RaRecord = any> =
	Props<RecordType> /*& ButtonProps*/;

/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
export type IQuickButton<RecordType extends RaRecord = any> = ShowButtonProps<RecordType>;

const scrollStates = {
	true: { _scrollToTop: true },
	false: {},
};

const inferModeFromUrl = (url:String) => {

    if (url.includes('create')) return 'create';
    if (url.includes('edit')) return 'edit';
    return 'show';
    
}
/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
const DashResourceButton = <RecordType extends RaRecord = any>(
	props: IQuickButton<RecordType>,
) => {
	const redirect = useRedirect();
	
	const ComponentType = props.children?.type || Button;
	const componentProps = { ...props, ...props.children?.props };

	let {
		record: recordProp,
		resource: resourceProp,
		navigate: navigate,
		scrollToTop: scrollToTop,
		mode: mode,
		navigation: navigation,
        resourceConfig: resourceConfig,
		//buttonProps: buttonProps,
		...rest
	} = componentProps;

    //debugger;

	const resource = useResourceContext(resourceProp);
	const record = useRecordContext(recordProp);

    /*if(navigate && !mode) {
        mode = inferModeFromUrl(navigate(record));
    } */


    if(!navigation) {
       
        navigation = resourceConfig?.drawer ? 
            (mode === 'edit' && resourceConfig.drawerOptions?.edit === false) ? 'redirect' :
            (mode === 'show' && resourceConfig.drawerOptions?.show === false) ? 'redirect' :
            (mode === 'create' && resourceConfig.drawerOptions?.create === false) ? 'redirect' :
            'virtualhash'
            : 'redirect';    
    }

    if(!navigate) {
        navigate = (_record) => {
            const url = `${URL_PREFIX}${resource}/${navigation === 'virtualhash' ? 'inline' : ''}${mode === 'edit' ? '/'+_record.id + '/edit' : mode === 'show' ? '/'+_record.id + '/show' : mode === 'create' ? '/create' : ''}`;  
            return url;
        }
    }


	//if (!record) return null;

	const { setVirtualHash } = useVirtualHash();

	const handleOnClick = (e: React.MouseEvent) => {

		e.preventDefault();
        e.stopPropagation();

        //debugger;

		if (navigation === 'virtualhash') {
            
            const vhash = navigate(record);
			//const vhash = `${URL_PREFIX}${resource}/${navigate ? navigate(record) : record.id}`;
         
			setVirtualHash(vhash);
		}

		if (navigation === 'redirect'){
         
			redirect(mode, resource, navigate(record));
        }

	};

	return (<>
    
		<ComponentType
			onClick={(e) => handleOnClick(e)}           
			state={scrollStates[String(scrollToTop)]}
			{...(rest as any)}
            alt={`${navigation} to ${mode}`}
		/>
	</>);
};

DashResourceButton.propTypes = {
	icon: PropTypes.element,
	label: PropTypes.string,
	record: PropTypes.any,
	scrollToTop: PropTypes.bool,
	navigate: PropTypes.func,
	navigation: PropTypes.string,
	children: PropTypes.element,
};

export default memo(
	DashResourceButton,
	(props: ShowButtonProps, nextProps: ShowButtonProps) =>
		props.resource === nextProps.resource &&
		(props.record && nextProps.record
			? props.record.id === nextProps.record.id
			: props.record == nextProps.record) && // eslint-disable-line eqeqeq
		props.label === nextProps.label,
);