import { tooltipClasses } from "@mui/material";
import { styled } from "@mui/system";
import { TooltipProps, Tooltip } from "antd";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    /* @ts-ignore */
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: 12,
    border: '1px solid #dadde9',
  },
}));

export default HtmlTooltip;