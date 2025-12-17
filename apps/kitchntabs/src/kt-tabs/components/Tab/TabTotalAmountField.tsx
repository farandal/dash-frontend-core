import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { Typography } from "@mui/material";
import { ITab } from '../../interfaces/ITab';
import { formatCurrencyWithTenant } from '../tab2/utils';

interface TabTotalAmountFieldProps extends IDashAutoAdminCustomFieldComponent {}

const TabTotalAmountFieldView: React.FC<TabTotalAmountFieldProps> = (props) => {
    const record = useRecordContext<ITab>();

    if (!record?.order?.total_amount) {
        return null;
    }

    // Use formatCurrencyWithTenant which handles tenant currency context automatically
    const formattedPrice = formatCurrencyWithTenant(record.order.total_amount);

    return (
        <Typography variant="body2">
            {formattedPrice}
        </Typography>
    );
};

const TabTotalAmountField: React.FC<TabTotalAmountFieldProps> = (props) => {
    const { method } = props;

    // We primarily support view/show/list for this read-only field
    switch (method) {
        case "view":
        case "list":
            return <TabTotalAmountFieldView {...props} />;
        case "edit":
        case "create":
            // Read-only in edit/create as well for now, or just return view
            return <TabTotalAmountFieldView {...props} />;
        default:
            return <TabTotalAmountFieldView {...props} />;
    }
};

export default TabTotalAmountField;
