import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useShowContext } from "react-admin";
import { ITab } from "../interfaces/ITab";
import MUISimpleJsonTable from "dash-admin/src/components/misc/MuiSimpleJsonTable";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const ViewMarketplaceDetail: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const { record: tab, isPending } = useShowContext<ITab>();

    if (tab?.order && tab?.order?.marketplace_info?.system_marketplace?.name === "Jumpseller") {
        const orderData = tab.order.data;
        return (
            <div style={{ padding: '20px' }}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Detalles del Pedido</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            <Typography><strong>ID del Pedido:</strong> {orderData.id}</Typography>
                            <Typography><strong>Estado:</strong> {orderData.status}</Typography>
                        </div>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Información del Cliente</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MUISimpleJsonTable tableData={orderData.customer || []} showKey vertical={true} />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Información de Envío</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                         <Typography style={{ marginTop: '10px' }}>
                            <strong>Dirección Completa:</strong> {`${orderData?.shipping_address?.address || ''}, ${orderData?.shipping_address?.complement || ''}, ${orderData?.shipping_address?.city || ''}, ${orderData?.shipping_address?.region || ''}`}
                        </Typography>
                        <MUISimpleJsonTable tableData={orderData?.shipping_address} showKey vertical={true} />
                       
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Información de Facturación</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MUISimpleJsonTable tableData={orderData?.billing_address} showKey vertical={true} />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Información de Pago</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography><strong>Total Pagado:</strong> ${orderData.total}</Typography>
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    }

    return <div>N/A</div>;
};

export default ViewMarketplaceDetail;