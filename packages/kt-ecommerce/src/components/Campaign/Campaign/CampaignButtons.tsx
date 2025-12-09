import { CampaignStatuses } from "../../../interfaces";
import {
  ButtonGroup,
  IconButton,
  Tooltip
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PublishIcon from "@mui/icons-material/Publish";
import PauseIcon from "@mui/icons-material/Pause";
import UpdateIcon from "@mui/icons-material/Update";
import StopIcon from "@mui/icons-material/Stop";

const CampaignButtons = ({ campaign, inTransitionState, navigate, publishCampaign, unpublishCampaign, updateCampaign, resetCampaign }) => {

    return (
   <><ButtonGroup
       size="small"
        variant="outlined"
        sx={{ display: 'flex', gap: 0}}
    >
     
        {/*<Tooltip title="Mostrar campaña">
          <span>
            <IconButton
              color="secondary"
              disabled={inTransitionState}
              onClick={() =>
                navigate(`/ecommerce/campaign/${campaign.id}/show`)
              }
            >
              <VisibilityIcon />
            </IconButton>
          </span>
        </Tooltip>*/}
        <Tooltip title="Editar campaña">
          <span>
            <IconButton
              color="secondary"
              disabled={inTransitionState}
              onClick={() =>
               /* (campaign.status === CampaignStatuses.PENDING ||
                  campaign.status ===
                  CampaignStatuses.PAUSED) &&
                !inTransitionState && */
                navigate(`/ecommerce/campaign/${campaign.id}`)
              }
            >
              <EditIcon />
            </IconButton>
          </span>
        </Tooltip>
        {!campaign.scheduled &&
          (campaign.status === CampaignStatuses.PENDING ||
            campaign.status === CampaignStatuses.PAUSED ||
            campaign.status === CampaignStatuses.PAUSING
        
        ) ? (
          <Tooltip title="Publicar campaña">
            <span>
              <IconButton
                color="secondary"
                disabled={inTransitionState}
                onClick={() => publishCampaign()}
              >
                <PublishIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : campaign.status === CampaignStatuses.PUBLISHED ? (
          <Tooltip title="Pausar campaña">
            <span>
              <IconButton
                color="secondary"
                disabled={inTransitionState}
                onClick={() => unpublishCampaign()}
              >
                <PauseIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <></>
        )}
        {campaign.status === CampaignStatuses.PUBLISHED && (
          <Tooltip title="Republicar productos">
            <span>
              <IconButton
                color="secondary"
                disabled={inTransitionState}
                onClick={() => updateCampaign()}
              >
                <UpdateIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

         {(campaign.status === CampaignStatuses.PUBLISHING || campaign.status === CampaignStatuses.PAUSING) && (
          <Tooltip title="Reset">
            <span>
              <IconButton
                color="secondary"
                //disabled={!!inTransitionState}
                onClick={() => resetCampaign()}
              >
                <StopIcon sx={{ color: 'red' }} />              
                </IconButton>
            </span>
          </Tooltip>
        )}
        
     </ButtonGroup></>
    )
  }

  export default CampaignButtons