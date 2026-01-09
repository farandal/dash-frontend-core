import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Grid, 
    Typography, 
    Skeleton,
} from '@mui/material';
import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';
import SelfServiceProductCard from '../components/SelfServiceProductCard';

// ----------------------------------------------------------------------
// SelfServiceProductGrid
// ----------------------------------------------------------------------

const SelfServiceProductGrid: React.FC = () => {
    const { products, isLoadingProducts } = useSelfServiceOrderCreate();
    const translate = useTranslate();

    if (isLoadingProducts) {
        return (
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {[...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (products.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                <Typography variant="h2" sx={{ opacity: 0.3, mb: 2 }}>🍽️</Typography>
                <Typography variant="h6">{translate('mall.no_products_found')}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Grid container spacing={2}>
                {products.map((product) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={product.id}>
                        <SelfServiceProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SelfServiceProductGrid;
