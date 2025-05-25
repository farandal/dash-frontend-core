import { FormTab } from 'react-admin';
import { Tab, Tabs, Box } from '@mui/material';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import groupByTabs from './utils/groupByTabs';
import AttributeToInput from './mui/AttributeToInput';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { useDispatch, useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { CLEAR_FORM_DATA, SET_FORM_DATA } from 'dash-admin-state/src/redux/actions/ActionTypes';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface IAutoForm {
    schema: IDashAutoAdminAttribute[],
    resourceConfig: IDashAutoAdminResourceConfig,
    options?: IDashAutoAdminFormOptions,
}

const CreateFormTabs = ({ schema, resourceConfig, options, isDrawer }) => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);

    const handleChange = (event) => {
        const { name, value, type } = event.target;
        let payloadValue;
        
        switch (type) {
            case 'checkbox':
                payloadValue = event.target.checked;
                break;
            case 'select':
                payloadValue = value;
                break;
            case 'text':
            case 'number':
            case 'email':
                payloadValue = value;
                break;
            default:
                payloadValue = value;
                break;
        }

        dispatch({ type: SET_FORM_DATA, payload: { [name]: payloadValue } });
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        return () => {
            dispatch({ type: CLEAR_FORM_DATA });
        };
    }, [dispatch]);

    const tabGroups = groupByTabs(schema);

    if (options?.meta?.tabs === "mui") {
        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTabChange}>
                        {tabGroups.map((group, idx) => (
                            <Tab key={`tab-${group[0].tab || idx}`} label={group[0].tab || options?.label || ''} />
                        ))}
                    </Tabs>
                </Box>
                {tabGroups.map((groupOfAttributes, idx) => {
                    let grouppedAttributes = groupOfAttributes.filter(
                        (attribute) => attribute?.inCreate !== false,
                    );
                    if (isDrawer) {
                        grouppedAttributes = grouppedAttributes.filter(
                            (attribute) => attribute?.inDrawer !== false,
                        );
                    }
                    return (
                        <div
                            role="tabpanel"
                            hidden={value !== idx}
                            key={`panel-${idx}`}
                            style={{ padding: '20px 0' }}
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('create', resourceConfig, attribute, i, { ...options, handleChange })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </Box>
        );
    }

    return groupByTabs(schema).map((groupOfAttributes, idx) => {
        let grouppedAttributes = groupOfAttributes.filter(
            (attribute) => attribute?.inCreate !== false,
        );

        if (isDrawer) {
            grouppedAttributes = grouppedAttributes.filter(
                (attribute) => attribute?.inDrawer !== false,
            );
        }
        return (
            grouppedAttributes.length && (
                <FormTab
                    key={`tab-${groupOfAttributes[0].tab || idx}`}
                    value={idx}
                    label={groupOfAttributes[0].tab || options?.label || ''}
                >
                    {grouppedAttributes.map((attribute, i) => (
                        <div key={`input-${i}`}>
                            {AttributeToInput('create', resourceConfig, attribute, i, { ...options, handleChange })}
                        </div>
                    ))}
                </FormTab>
            )
        );
    });
};

const EditFormTabs = ({ schema, resourceConfig, options, isDrawer }) => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);

    const handleChange = (event) => {
        const { name, value, type } = event.target;
        let payloadValue;
        
        switch (type) {
            case 'checkbox':
                payloadValue = event.target.checked;
                break;
            case 'select':
                payloadValue = value;
                break;
            case 'text':
            case 'number':
            case 'email':
                payloadValue = value;
                break;
            default:
                payloadValue = value;
                break;
        }

        dispatch({ type: SET_FORM_DATA, payload: { [name]: payloadValue } });
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        return () => {
            dispatch({ type: CLEAR_FORM_DATA });
        };
    }, [dispatch]);

    const tabGroups = groupByTabs(schema);
    if (options?.meta?.tabs === "mui") {
        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTabChange}>
                        {tabGroups.map((group, idx) => (
                            <Tab key={`tab-${group[0].tab || idx}`} label={group[0].tab || options?.label || ''} />
                        ))}
                    </Tabs>
                </Box>
                {tabGroups.map((groupOfAttributes, idx) => {
                    let grouppedAttributes = groupOfAttributes.filter(
                        (attribute) => attribute?.inEdit !== false,
                    );
                    if (isDrawer) {
                        grouppedAttributes = grouppedAttributes.filter(
                            (attribute) => attribute?.inDrawer !== false,
                        );
                    }
                    return (
                        <div
                            role="tabpanel"
                            hidden={value !== idx}
                            key={`panel-${idx}`}
                            style={{ padding: '20px 0' }}
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('edit', resourceConfig, attribute, i, { ...options, handleChange })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </Box>
        );
    }

    return groupByTabs(schema).map((groupOfAttributes, idx) => {
        let grouppedAttributes = groupOfAttributes.filter(
            (attribute) => attribute?.inEdit !== false,
        );
        if (isDrawer) {
            grouppedAttributes = grouppedAttributes.filter(
                (attribute) => attribute?.inDrawer !== false,
            );
        }

        return (
            grouppedAttributes.length && (
                <FormTab
                    key={`tab-${groupOfAttributes[0].tab || idx}`}
                    value={idx}
                    label={groupOfAttributes[0].tab || options?.label || ''}
                >
                    {grouppedAttributes.map((attribute, i) => (
                        <div key={`input-${i}`}>
                            {AttributeToInput('edit', resourceConfig, attribute, i, { ...options, handleChange })}
                        </div>
                    ))}
                </FormTab>
            )
        );
    });
};

const ViewFormTabs = ({ schema, resourceConfig, options, isDrawer }) => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);

    const handleChange = (event) => {
        const { name, value, type } = event.target;
        let payloadValue;
        
        switch (type) {
            case 'checkbox':
                payloadValue = event.target.checked;
                break;
            case 'select':
                payloadValue = value;
                break;
            case 'text':
            case 'number':
            case 'email':
                payloadValue = value;
                break;
            default:
                payloadValue = value;
                break;
        }

        dispatch({ type: SET_FORM_DATA, payload: { [name]: payloadValue } });
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        return () => {
            dispatch({ type: CLEAR_FORM_DATA });
        };
    }, [dispatch]);

    const tabGroups = groupByTabs(schema);

    if (options?.meta?.tabs === "mui") {
        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTabChange}>
                        {tabGroups.map((group, idx) => (
                            <Tab key={`tab-${group[0].tab || idx}`} label={group[0].tab || options?.label || ''} />
                        ))}
                    </Tabs>
                </Box>
                {tabGroups.map((groupOfAttributes, idx) => {
                    let grouppedAttributes = groupOfAttributes.filter(
                        (attribute) => attribute?.inShow !== false,
                    );
                    if (isDrawer) {
                        grouppedAttributes = grouppedAttributes.filter(
                            (attribute) => attribute?.inDrawer !== false,
                        );
                    }
                    return (
                        <div
                            role="tabpanel"
                            hidden={value !== idx}
                            key={`panel-${idx}`}
                            style={{ padding: '20px 0' }}
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('view', resourceConfig, attribute, i, { ...options, handleChange })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </Box>
        );
    }

    return groupByTabs(schema).map((groupOfAttributes, idx) => {
        let grouppedAttributes = groupOfAttributes.filter(
            (attribute) => attribute?.inShow !== false,
        );
        if (isDrawer) {
            grouppedAttributes = grouppedAttributes.filter(
                (attribute) => attribute?.inDrawer !== false,
            );
        }
        return (
            grouppedAttributes.length && (
                <FormTab
                    key={`tab-${groupOfAttributes[0].tab || idx}`}
                    value={idx}
                    label={groupOfAttributes[0].tab || options?.label || ''}
                >
                    {grouppedAttributes.map((attribute, i) => (
                        <div key={`input-${i}`}>
                            {AttributeToInput('view', resourceConfig, attribute, i, { ...options, handleChange })}
                        </div>
                    ))}
                </FormTab>
            )
        );
    });
};

const DashAutoFormMuiTabs = ({
    schema,
    resourceConfig,
    options
}: IAutoForm) => {
    const isDrawer = options.isDrawer === true ? true : false;
    const meta = options?.meta || {};

    const commonProps = {
        schema,
        resourceConfig,
        options,
        isDrawer
    };
    
    switch (options.mode) {
        case 'create':
            return <CreateFormTabs {...commonProps} />;
        case 'edit':
            return <EditFormTabs {...commonProps} />;
        case 'view':
            return <ViewFormTabs {...commonProps} />;
        default:
            return null;
    }
};

export default DashAutoFormMuiTabs;