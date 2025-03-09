import * as React from 'react';

import { Card, CardContent, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'	

export interface INoResults extends React.PropsWithChildren {
    title?: string;
    description?: string;
}
const NoResults: React.FC<INoResults> = (props) => {

    const { title, description, children } = props;

	return (
		<Card sx={{ p: 0 }}>
			<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 2 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<InfoIcon sx={{ fontSize: 32 }} />

				{title && <Typography variant="h5">{title}</Typography>}
				</div>
				{description && <Typography variant="body1" color="text.secondary">{description}</Typography>}
				{children ? children : <></>}
			</CardContent>
		</Card>	);
};

export default NoResults