import {
    Box,
    Grid,
    Typography
} from "@mui/material";
import { Tag } from "react-feather";

const CampaignStats = ({ campaign }) => {
    return <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="success" />
                <Typography variant="subtitle2">Productos</Typography>
                <Typography variant="h6">{campaign.products_count}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="error" />
                <Typography variant="subtitle2">Errores</Typography>
                <Typography variant="h6">{campaign.total_errored}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="info" />
                <Typography variant="subtitle2">Finalizados</Typography>
                <Typography variant="h6">{campaign.total_finished}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="warning" />
                <Typography variant="subtitle2">Pausados</Typography>
                <Typography variant="h6">{campaign.total_paused}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="default" />
                <Typography variant="subtitle2">Pendientes</Typography>
                <Typography variant="h6">{campaign.total_pending}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="primary" />
                <Typography variant="subtitle2">Publicados</Typography>
                <Typography variant="h6">{campaign.total_published}</Typography>
            </Box>
        </Grid>
        <Grid>
            <Box display="flex" alignItems="center" gap={1}>
                <Tag color="success" />
                <Typography variant="subtitle2">Ventas</Typography>
                <Typography variant="h6">{campaign.total_sales}</Typography>
            </Box>
        </Grid>
    </Grid>
}

export default CampaignStats