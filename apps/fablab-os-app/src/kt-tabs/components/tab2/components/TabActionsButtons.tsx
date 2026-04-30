import React from 'react';
import { ButtonGroup, IconButton } from '@mui/material';
import { Download, Payment, Print } from '@mui/icons-material';
import { useTranslate } from 'react-admin';
import DashResourceButton from 'dash-auto-admin/src/toolbar/buttons/DashResourceButton';
import { ITab } from './interfaces/ITab';


interface TabActionButtonsProps {
    tab: ITab;
    resourceConfig: any;
    onPrint?: (tabId: string) => void;
    onDownload?: (tabId: string) => void;
    onPayment?: (tab: ITab) => void;
    showEdit?: boolean;
    showView?: boolean;
    showPrint?: boolean;
    showDownload?: boolean;
    showPayment?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const TabActionButtons: React.FC<TabActionButtonsProps> = ({
    tab,
    resourceConfig,
    onPrint,
    onDownload,
    onPayment,
    showEdit = true,
    showView = true,
    showPrint = true,
    showDownload = true,
    showPayment = false,
    size = 'large'
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

    if (!tab) {
        return null;
    }

    return (
        <ButtonGroup size={size}>
            {showView && (
                <DashResourceButton 
                    resource={resourceConfig.model}
                    record={tab}
                    resourceConfig={resourceConfig}
                    mode="show"
                    title={translate('common.view')}
                />
            )}
            
            {showEdit && !tab?.order?.marketplace_info && (
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
                >
                    <Print />
                </IconButton>
            )}
            
            {showDownload && (
                <IconButton
                    size={size}
                    onClick={handleDownload}
                    title={translate('tab.action.download')}
                >
                    <Download />
                </IconButton>
            )}
            
            {/*showPayment && !tab?.order?.marketplace_info && (
                <IconButton
                    size={size}
                    onClick={handlePayment}
                    title={translate('tab.action.payment')}
                >
                    <Payment />
                </IconButton>
            )*/}
        </ButtonGroup>
    );
};

export default TabActionButtons;
