import { CampaignStatuses } from "../../../interfaces";
import {
    ButtonGroup,
    IconButton,
    Tooltip
} from "@mui/material";
import { useParams } from "react-router";
import { useAxios } from 'dash-axios-hook';
import { useDialog } from "dash-dialog";
import { useRefresh } from "react-admin";
import { getCookie } from "dash-admin/src/utils/cookies";
import queryString from "query-string";
import MarketplaceTag from "./Misc/MarketplaceTag";
import MUISimpleJsonTable from "./MuiSimpleJsonTable";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PublishIcon from "@mui/icons-material/Publish";
import PauseIcon from "@mui/icons-material/Pause";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import StopIcon from "@mui/icons-material/Stop";
import PlayIcon from "@mui/icons-material/PlayArrow";

const CampaignProductsBatchActions = ({ batchSelectedCampaignProducts, campaign }) => {
    const { id } = useParams();
    const axios = useAxios();
    const dialog = useDialog();
    const refresh = useRefresh();

    const errorDialog = (content: string) => {
        dialog({
            variant: "danger",
            title: "Error",
            content: content
        });
    };

    const changeProductStatus = async (productIds: number[], status: string) => {
        const tenant_id = dashStorage.getItem("tenant_id");

        window.dispatchEvent(
            new MessageEvent('dash-global-loader', { data: true })
        );

        try {
            let action = axios.put;
            let url = `/ecommerce/campaign/${id}/products/${status}`;

            const payload = {
                tenant_id: Number(tenant_id),
                product_ids: productIds,
                campaign_marketplace_ids: Array.from(new Set(
                    batchSelectedCampaignProducts.flatMap(product =>
                        product.campaign_marketplaces.map(marketplace => marketplace.id)
                    )
                ))
            };

            if (status === "delete" || status === "finish") {
                const processedQuery = queryString.stringify({
                    ...payload,
                    action: status
                }, {
                    arrayFormat: "bracket",
                });

                url = `/ecommerce/campaign/${id}/products?${processedQuery}`;
                action = axios.delete;
            }

            await action(url, payload);


            /*
            Message is dispatched at CampaignEdit when products are loaded after the refresh. 
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false })
            );*/



        } catch (error: any) {
            errorDialog(
                error?.response?.data?.message ||
                "Ha ocurrido un error al cambiar de estado los productos"
            );
        } finally {
            refresh();
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false })
            );
        }
    };

    const resumeProducts = () => {
        dialog({
            variant: "info",
            title: "Publicar productos",
            content: "¿Está seguro de publicar los productos seleccionados en todos los marketplaces?",

            showCancelButton: true,
            onConfirm: () => {

                changeProductStatus(batchSelectedCampaignProducts.map(p => p.id), "publish");
            },
            onCancel: () => {
                // Handle cancel action
            }
        });
    }

    const pauseProducts = () => {
        dialog({
            variant: "info",
            title: "Pausar productos",
            content: "¿Está seguro de pausar los productos seleccionados en todos los marketplaces?",
            showCancelButton: true,
            onConfirm: () => {

                changeProductStatus(batchSelectedCampaignProducts.map(p => p.id), "pause");
            },
            onCancel: () => {
                // Handle cancel action
            }
        });
    }

    const deleteProducts = () => {
        dialog({
            variant: "info",
            title: "Eliminar productos",
            content: "¿Está seguro de eliminar los productos seleccionados de la campaña, incluyendo sus publicaciones en todos los marketplaces asociados? también lo eliminará de la campaña",
            showCancelButton: true,
            onConfirm: () => {

                changeProductStatus(batchSelectedCampaignProducts.map(p => p.id), "delete");
            },
            onCancel: () => {
                // Handle cancel action
            }
        });
    }

    const finishProducts = () => {
        dialog({
            variant: "info",
            title: "Terminar producto en marketplkace",
            content: "¿Está seguro de eliminar los productos seleccionados del marketplace, eliminará la publicaciín en todos los marketplaces asociados, pero no lo eliminará de la camapaña",
            showCancelButton: true,
            onConfirm: () => {

                changeProductStatus(batchSelectedCampaignProducts.map(p => p.id), "finish");
            },
            onCancel: () => {
                // Handle cancel action
            }
        });
    }

    if (!batchSelectedCampaignProducts || batchSelectedCampaignProducts.length === 0) { return <></> }
    return (
        <ButtonGroup
            size="small"
            variant="outlined"
            sx={{ display: 'flex', gap: 0 }}
        >
            <Tooltip title="Republicar">
                <span>
                    <IconButton
                        color="secondary"
                        onClick={() => resumeProducts()}
                    >
                        <PlayIcon />
                    </IconButton>
                </span>
            </Tooltip>


            <Tooltip title="Pausar">
                <span>
                    <IconButton
                        color="secondary"
                        onClick={() => pauseProducts()}
                    >
                        <PauseIcon />
                    </IconButton>
                </span>
            </Tooltip>


            <Tooltip title="Terminar">
                <span>
                    <IconButton
                        color="secondary"
                        onClick={() => finishProducts()}
                    >
                        <StopIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Eliminar">
                <span>
                    <IconButton
                        color="secondary"
                        onClick={() => deleteProducts()}
                    >
                        <DeleteIcon />
                    </IconButton>
                </span>
            </Tooltip>



        </ButtonGroup>
    )
}

export default CampaignProductsBatchActions