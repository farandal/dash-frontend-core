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
import { MallStoreSelector } from './MallStoreSelector';
import { MallAssistanceButton } from './MallAssistanceButton';
import { MallSearchBox } from './MallSearchBox';
import { MallPaginationToggle } from './MallPaginationToggle';
import { MallProductGrid } from './MallProductGrid';
import { MallOrderSummaryDrawer } from './MallOrderSummaryDrawer';
import { MallProductModifiersModal } from './MallProductModifiersModal';

interface MallOrderCreateViewProps extends IDashAutoAdminCustomFieldComponent {
    productsField?: string;
}

/**
 * MallOrderCreateView - Main composition component for mall order creation
 * 
 * This component assembles all the UI pieces for the mall ordering experience:
 * - Left sidebar with vertical scrollable store selector
 * - Cart summary header
 * - Assistance button
 * - Product grid (with integrated search and pagination toggle)
 * - Cart drawer
 * - Product modifiers modal
 * 
 * Layout: Two-column design with stores on left, main content on right
 * 
 * Note: MallOrderCreateProvider is provided by MallTabsContextV2 at the context level.
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
        <Box className="kt-mall-client-tab-create-view">

            
            {/* Left Sidebar - Vertical Store Selector */}
            <Box className="kt-mall-client-tab-sidebar">
                {/* Store Selector - Now Vertical */}
                <MallStoreSelector />
            </Box>

            {/* Main Content Area */}
            <Box className="kt-mall-client-tab-main-content">
                {/* Header Section */}
                <div
                    //elevation={0}
                    className="kt-mall-client-tab-header"
                >
                    {/* Search Box */}
                    
                    {/*<Box display="flex" justifyContent="space-between" alignItems="center">
                        <MallSearchBox />
                        <MallPaginationToggle showLabel={false} />
                    </Box>*/}

                    {/* Assistance Button - Own Row */}
                    <Box className="kt-mall-client-tab-assistance-container">
                        <MallAssistanceButton />
                    </Box>
                </div>

                {/* Products Section */}
                <Box className="kt-mall-client-tab-products-section">
                    <MallProductGrid />
                </Box>
            </Box>

            {/* Cart Drawer */}
            <MallOrderSummaryDrawer />
            
            {/* Product Modifiers Modal (V1 feature ported) */}
            <MallProductModifiersModal />
        </Box>
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
