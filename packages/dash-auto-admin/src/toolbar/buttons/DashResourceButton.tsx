import * as React from 'react';
import { memo } from 'react';
import PropTypes from 'prop-types';
import {DASHAppConstants} from 'dash-constants';

import {
    useResourceContext,
    useRecordContext,
    useRedirect,

} from 'react-admin';

import {
    RaRecord
} from 'react-admin';

import useVirtualHash from '../../hooks/useVirtualHash';
import IDashAutoAdminResourceConfig from '../../interfaces/IDashAutoAdminResourceConfig';
import { IconButton, Tooltip } from '@mui/material';

import { Add, Edit, Visibility, Delete } from '@mui/icons-material'
import { DeleteWithConfirmButton } from 'react-admin';
import { useNavigate } from 'react-router';
const URL_PREFIX = DASHAppConstants.system.URL_PREFIX;
/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
interface Props<RecordType extends RaRecord = any> {
    label?: string;
    record?: RecordType;
    resource?: string;
    navigate?: (record?: RecordType) => string;
    navigation?: 'redirect' | 'virtualhash';
    mode: 'show' | 'create' | 'edit' | 'destroy' | 'custom';
    size?: 'small' | 'medium' | 'large';
    scrollToTop?: boolean;
    resourceConfig?: IDashAutoAdminResourceConfig;
    children?: React.JSX.Element;
    showIcon?: boolean;
    title?: string;
    icon?: React.JSX.Element;
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

const inferModeFromUrl = (url: String) => {

    if (url.includes('create')) return 'create';
    if (url.includes('edit')) return 'edit';
    return 'show';

}
/* @ts-ignore Expected Cannot use namespace 'RaRecord' as a type.ts(2709) */
const DashResourceButton = <RecordType extends RaRecord = any>(
    props: IQuickButton<RecordType>,
) => {
    const redirect = useRedirect();
    //const redirect = useNavigate();

    const ComponentType = props.children?.type || IconButton;
    const componentProps = { ...props, ...props.children?.props };

    let {
        navigate,
        scrollToTop,
        mode,
        size,
        navigation,
        resourceConfig,
        record: _inputRecord,
        resource: _inputResource,
        showIcon = true,
        title,
        icon,
        ...rest
    } = componentProps;

    const resource = _inputResource || useResourceContext();
    const record = _inputRecord || useRecordContext();
    if (!size) { size = 'small' }

    /*if(navigate && !mode) {
        mode = inferModeFromUrl(navigate(record));
    } */

    if (!navigation) {

        navigation = resourceConfig?.drawer ?
            (mode === 'edit' && resourceConfig.drawerOptions?.edit === false) ? 'redirect' :
                (mode === 'show' && resourceConfig.drawerOptions?.show === false) ? 'redirect' :
                    (mode === 'create' && resourceConfig.drawerOptions?.create === false) ? 'redirect' :
                        'virtualhash'
            : 'redirect';
    }

    if (!navigate) {
        navigate = (_record) => {
            const url = `${URL_PREFIX}${resource}/${navigation === 'virtualhash' ? 'inline' : ''}${mode === 'edit' ? '/' + _record.id + '/edit' : mode === 'show' ? '/' + _record.id + '/show' : mode === 'create' ? '/create' : ''}`;
            return url;
        }
    }


    //if (!record) return null;

    const { setVirtualHash } = useVirtualHash();

    const handleOnClick = (e: React.MouseEvent) => {

        e.preventDefault();
        e.stopPropagation();

        if(componentProps.onClick) {
          componentProps.onClick(e);
          return;
        }
        if (navigation === 'virtualhash') {

            const vhash = navigate(record);
            //const vhash = `${URL_PREFIX}${resource}/${navigate ? navigate(record) : record.id}`;

            setVirtualHash(vhash);
        }

        if (navigation === 'redirect') {

            if (mode === "create") {
                redirect(mode, resource)
            } else {
                redirect(mode, resource, record.id);
            }

        }

    };

    const _styles = size === 'small' ? {
        '& .MuiButton-startIcon': { margin: 0 },
        '& .MuiButton-text': { paddingLeft: '4px' },
        borderRadius: '50% !important',
        padding: 0,
        minWidth: '35px',
        width: '35px',
        height: '35px',
        overflow: 'hidden'
    } : {}

    const _label = size === 'small' ? '' : props?.label;
    
    if (mode === "destroy") {
        return <Tooltip title={props?.label}><DeleteWithConfirmButton label={_label} sx={{ ..._styles }} size={size} record={record} /></Tooltip>
    } else if (mode === "custom") {
        // Remove title prop from rest to avoid conflict with Tooltip
        const { title, ...restWithoutTitle } = rest as any;
        return <Tooltip title={props?.label}><ComponentType
            onClick={(e) => handleOnClick(e)}
            state={scrollStates[String(scrollToTop)]}
            size={size}
            {...restWithoutTitle}
        /></Tooltip>
    } else {
        // If showIcon is false and children are provided, render children with click handler
        if (!showIcon && props.children) {
            return React.cloneElement(props.children, {
                onClick: (e: React.MouseEvent) => handleOnClick(e),
                ...props.children.props
            });
        }

        // For cases with no children, we need to keep the title prop
        const { title, ...restWithoutTitle } = rest as any;
        
        const button = <ComponentType
            onClick={(e) => handleOnClick(e)}
            state={scrollStates[String(scrollToTop)]}
            size={size}
            title={props.children ? undefined : title} // Keep title only when no children
            {...restWithoutTitle}
        >
            {showIcon && (
                icon ? icon :
                mode === 'edit' ? <Edit /> :
                    mode === 'show' ? <Visibility /> :
                        mode === 'create' ? <Add /> :
                            mode
            )}
        </ComponentType>

        return <Tooltip title={props?.label || ''}>
            {button}
        </Tooltip>;
    }
};

DashResourceButton.propTypes = {
    icon: PropTypes.element,
    label: PropTypes.string,
    record: PropTypes.any,
    scrollToTop: PropTypes.bool,
    navigate: PropTypes.func,
    navigation: PropTypes.string,
    children: PropTypes.element,
    showIcon: PropTypes.bool,
};

export default memo(
    DashResourceButton,
    (props: ShowButtonProps, nextProps: ShowButtonProps) =>
        props.resource === nextProps.resource &&
        (props.record && nextProps.record
            ? props.record.id === nextProps.record.id
            : props.record == nextProps.record) && // eslint-disable-line eqeqeq
        props.label === nextProps.label &&
        props.showIcon === nextProps.showIcon &&
        props.icon === nextProps.icon,
);
