import React from 'react';
import { ButtonGroup, IconButton, CircularProgress } from '@mui/material';
import { Download, Payment, Print, Close } from '@mui/icons-material';
import { useTranslate } from 'react-admin';
import DashResourceButton from 'dash-auto-admin/src/toolbar/buttons/DashResourceButton';
import { ITab } from '../interfaces/ITab';

interface TabActionButtonsProps {
    tab: ITab;
    resourceConfig: any;
    onPrint?: (tabId: number) => void;
    onDownload?: (tabId: number) => void;
    onPayment?: (tab: ITab) => void;
    onClose?: (tab: ITab) => void;
    onCancel?: (tab: ITab) => void;
    showClose?: boolean;
    showCancel?: boolean;
    showEdit?: boolean;
    showView?: boolean;
    showPrint?: boolean;
    showDownload?: boolean;
    showPayment?: boolean;
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
}

const TabActionButtons: React.FC<TabActionButtonsProps> = ({
    tab,
    resourceConfig,
    onPrint,
    onDownload,
    onPayment,
    onClose,
    onCancel,
    showCancel = true,
    showClose = true,
    showEdit = true,
    showView = true,
    showPrint = true,
    showDownload = true,
    showPayment = true,
    size = 'small',
    loading = false,
    disabled = false
}) => {
    const translate = useTranslate();

    const handlePrint = () => {
        if (onPrint && tab?.id) {
            onPrint(tab.id);
        }
    };

    const handleDownload = () => {
        if (onDownload && tab?.id) {
            onDownload(tab.id);
        }
    };

    const handlePayment = () => {
        if (onPayment && tab) {
            onPayment(tab);
        }
    };

    const handleClose = () => {
        if (onClose && tab) {
            onClose(tab);
        }
    };

    const handleCancel = () => {
        if (onCancel && tab) {
            onCancel(tab);
        }
    };

    if (!tab) {
        return null;
    }

    return (
        <ButtonGroup size={size} disabled={disabled || loading}>
            {showView && (
                <DashResourceButton
                    resource={resourceConfig.model}
                    record={tab}
                    resourceConfig={resourceConfig}
                    mode="show"
                    title={translate('common.view')}
                />
            )}
            {showEdit /*&& !tab?.order?.marketplace_info*/ && (
                <DashResourceButton
                    resource={resourceConfig.model}
                    record={tab}
                    resourceConfig={resourceConfig}
                    mode="edit"
                    title={translate('common.edit')}
                />
            )}
            {showPrint && (
                <IconButton
                    size={size}
                    onClick={handlePrint}
                    title={translate('tab.action.print')}
                    disabled={disabled || loading}
                >
                    <Print />
                </IconButton>
            )}
            {showDownload && (
                <IconButton
                    size={size}
                    onClick={handleDownload}
                    title={translate('tab.action.download')}
                    disabled={disabled || loading}
                >
                    <Download />
                </IconButton>
            )}
            
            
            {showPayment && !tab?.order?.is_paid && (
                <IconButton
                    size={size}
                    onClick={handlePayment}
                    title={translate('tab.action.payment')}
                    disabled={disabled || loading}
                >
                     {loading ? <CircularProgress size={24} color="inherit" /> : <Payment />}
                </IconButton>
            )}
            {showCancel && (
                <IconButton
                    size={size}
                    onClick={handleCancel}
                    title={translate('tab.action.cancel')}
                    color="error"
                    disabled={disabled || loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : <Close />}
                </IconButton>
            )}
        </ButtonGroup>
    );
};

export default TabActionButtons;