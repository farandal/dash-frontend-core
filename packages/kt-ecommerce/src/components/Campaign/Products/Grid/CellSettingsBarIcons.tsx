
import Badge, { BadgeProps } from '@mui/material/Badge';
//import GearIcon from '@mui/icons-material/Settings';
import styled from '@emotion/styled';
import * as Icons from  '@mui/icons-material';

import { FC } from "react";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
   '& .MuiBadge-badge': {
        padding: 0,
    },
}));

export interface ISettingsBadge {
    onClick: (e:any) => any
    children: React.ReactNode
}

export const GearBadge:FC<ISettingsBadge> = (props) => {
    return <StyledBadge onClick={props.onClick} badgeContent={<Icons.Settings sx={{ fontSize: 16, color:"#555" }} fontSize={"small"} />} color="default">{props.children}</StyledBadge>

}

export const AlertBadge:FC<ISettingsBadge> = (props) => {
    return <StyledBadge onClick={props.onClick} badgeContent={<Icons.Warning sx={{ fontSize: 16, color:"oragne" }} fontSize={"small"} />} color="default">{props.children}</StyledBadge>

}

export const ErrorBadge:FC<ISettingsBadge> = (props) => {
    return <StyledBadge onClick={props.onClick} badgeContent={<Icons.Error sx={{ fontSize: 16, color:"red" }} fontSize={"small"} />} color="default">{props.children}</StyledBadge>

}

export default GearBadge;