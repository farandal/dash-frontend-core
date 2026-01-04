import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useShowContext, useTranslate } from "react-admin";
import { ITab } from "../interfaces/ITab";
import { MuiSimpleJsonTable as MUISimpleJsonTable } from "kt-ecommerce";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const ViewMarketplaceDetail: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const { record: tab, isPending } = useShowContext<ITab>();
    const translate = useTranslate();

    if (tab?.order && tab?.order?.marketplace_info?.system_marketplace?.name === "Jumpseller") {
        const orderData = tab.order.data;
        return (
            <div style={{ padding: '20px' }}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{translate('tab.marketplace_view.order_details')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            <Typography><strong>{translate('tab.marketplace_view.order_id')}</strong> {orderData.id}</Typography>
                            <Typography><strong>{translate('tab.marketplace_view.status')}</strong> {orderData.status}</Typography>
                        </div>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{translate('tab.marketplace_view.customer_info')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MUISimpleJsonTable tableData={orderData.customer || []} showKey vertical={true} />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{translate('tab.marketplace_view.shipping_info')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                         <Typography style={{ marginTop: '10px' }}>
                            <strong>{translate('tab.marketplace_view.full_address')}</strong> {`${orderData?.shipping_address?.address || ''}, ${orderData?.shipping_address?.complement || ''}, ${orderData?.shipping_address?.city || ''}, ${orderData?.shipping_address?.region || ''}`}
                        </Typography>
                        <MUISimpleJsonTable tableData={orderData?.shipping_address} showKey vertical={true} />
                       
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{translate('tab.marketplace_view.billing_info')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MUISimpleJsonTable tableData={orderData?.billing_address} showKey vertical={true} />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{translate('tab.marketplace_view.payment_info')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography><strong>{translate('tab.marketplace_view.total_paid')}</strong> ${orderData.total}</Typography>
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    }

    return <div>{translate('tab.marketplace_view.na')}</div>;
};

export default ViewMarketplaceDetail;