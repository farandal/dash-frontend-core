import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export interface INoResults extends React.PropsWithChildren {
    title?: string;
    description?: string;
}

const NoResults: React.FC<INoResults> = React.memo((props) => {
    const { title, description, children } = props;

    // Memoize styles to prevent recalculation on every render
    const styles = React.useMemo(() => ({
        card: { p: 0 },
        cardContent: { 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'left', 
            gap: 2 
        },
        header: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
        },
        icon: { fontSize: 32 }
    }), []);

    React.useEffect(() => {
        console.log("Reloaded");
    },[])

    return (
        <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
                <div style={styles.header}>
                    <InfoIcon sx={styles.icon} />
                    {title && <Typography variant="h5">{title}</Typography>}
                </div>
                {description && (
                    <Typography variant="body1" color="text.secondary">
                        {description}
                    </Typography>
                )}
                {children}
            </CardContent>
        </Card>
    );
});

NoResults.displayName = 'NoResults';

export default NoResults;