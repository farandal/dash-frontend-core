import React from 'react';
import { useTranslate, useNotify } from 'react-admin';
import { 
    Box, 
    useMediaQuery,
    useTheme,
    Drawer,
    IconButton,
    Button,
    Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';
import SelfServiceProductGrid from './SelfServiceProductGrid';
import SelfServiceOrderSummaryDrawer from './SelfServiceOrderSummaryDrawer';
import SelfServiceProductModifiersModal from './SelfServiceProductModifiersModal';

interface SelfServiceOrderCreateViewProps extends IDashAutoAdminCustomFieldComponent {
    productsField?: string;
}

const SelfServiceOrderCreateView: React.FC<SelfServiceOrderCreateViewProps> = (props) => {
    const translate = useTranslate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { 
        setIsCartDrawerOpen, 
        cartItemCount 
    } = useSelfServiceOrderCreate();
    
    // Get session ID from URL or context - assuming it's in the URL path for now or context
    // This is a simplification, in real app might come from context
    const pathMatch = window.location.pathname.match(/\/selfservice\/([A-Z0-9]{5,})/i);
    const sessionHash = pathMatch ? pathMatch[1] : '';

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Toolbar (Simplified for Self-Service) */}
            <Box 
                sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}
            >
                {/* Search Box / Filters could go here */}
                <Box sx={{ flex: 1 }} />

                {/* Cart Button */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                        <Badge badgeContent={cartItemCount} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    }
                    onClick={() => setIsCartDrawerOpen(true)}
                >
                    {translate('mall.view_order')}
                </Button>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'grey.50' }}>
                <SelfServiceProductGrid />
            </Box>

            {/* Cart Drawer & Modals */}
            <SelfServiceOrderSummaryDrawer />
            <SelfServiceProductModifiersModal />
        </Box>
    );
};

export default SelfServiceOrderCreateView;
