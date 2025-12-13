import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { MallOrderCreateProvider } from '../contexts/MallOrderCreateContext';
import { MallStoreSelector } from './MallStoreSelector';
import { MallAssistanceButton } from './MallAssistanceButton';
import { MallSearchBox } from './MallSearchBox';
import { MallPaginationToggle } from './MallPaginationToggle';
import { MallProductGrid } from './MallProductGrid';
import { MallCartSummary } from './MallCartSummary';
import { MallOrderSummaryDrawer } from './MallOrderSummaryDrawer';
import { MallProductModifiersModal } from './MallProductModifiersModal';

interface MallOrderCreateViewProps extends IDashAutoAdminCustomFieldComponent {
    productsField?: string;
}

/**
 * MallOrderCreateView - Main composition component for mall order creation
 * 
 * This component assembles all the UI pieces for the mall ordering experience:
 * - Cart summary header
 * - Store selector (horizontal scrolling)
 * - Assistance button
 * - Search box
 * - Pagination toggle
 * - Product grid
 * - Cart drawer
 */
export const MallOrderCreateView: React.FC<MallOrderCreateViewProps> = (props) => {
    const { attribute, productsField = 'products' } = props;
    const translate = useTranslate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Use attribute name as productsField if provided (from schema)
    const effectiveProductsField = typeof attribute === 'string' 
        ? attribute 
        : (attribute?.attribute || productsField);

    return (
        <MallOrderCreateProvider productsField={effectiveProductsField}>
            <Box
                className="kt-mall-order-create-view"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: '70vh',
                    //backgroundColor: 'background.default',
                }}
            >
                {/* Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 0,
                        //backgroundColor: 'background.paper',
                        background: 'none',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    {/* Cart Summary */}
                    <MallCartSummary />

                    {/* Store Selector */}
                    <Box sx={{ mb: 2, background: 'none' }}>
                        <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 600 }}
                        >
                            {translate('mall.select_store')}
                        </Typography>
                        <MallStoreSelector />
                    </Box>

                    {/* Assistance Button - Own Row */}
                    <Box sx={{ mb: 2 }}>
                        <MallAssistanceButton />
                    </Box>

                    {/* Search + Pagination Toggle Row */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 2,
                            backgroundColor: 'transparent',
                        }}
                    >
                        {/* Search Box */}
                        <Box sx={{ flexGrow: 1 }}>
                            <MallSearchBox />
                        </Box>

                        {/* Pagination Toggle - Hide label on mobile */}
                        <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                            <MallPaginationToggle /*showLabel={!isMobile}*/ />
                        </Box>
                    </Box>
                </Paper>

                {/* Products Section */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <MallProductGrid />
                </Box>

                {/* Cart Drawer */}
                <MallOrderSummaryDrawer />
                
                {/* Product Modifiers Modal (V1 feature ported) */}
                <MallProductModifiersModal />
            </Box>
        </MallOrderCreateProvider>
    );
};

/**
 * MallOrderCreateField - Custom field component wrapper for React-Admin forms
 * 
 * This can be used as a customFieldComponent in the schema configuration.
 */
export const MallOrderCreateField: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method } = props;

    // Only render for create mode
    if (method !== 'create') {
        return null;
    }

    return <MallOrderCreateView {...props} />;
};

export default MallOrderCreateView;
