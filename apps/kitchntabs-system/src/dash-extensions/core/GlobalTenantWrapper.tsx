import { AuthPersistenceService } from "dash-auth";
import { DASH_REDUX_ACTIONS } from "dash-admin-state";
import { useDispatch } from "react-redux";
import DashThemeContext from 'dash-admin/src/default-theme/DashThemeContext';
import React, { PropsWithChildren, useEffect } from "react";

export interface IGlobalTenantWrapper extends PropsWithChildren {
    tenantData?: any;
}

// Tenant Data Fetcher Component that runs inside DashThemeProvider
const GlobalTenantWrapper: React.FC<IGlobalTenantWrapper> = (props) => {
    const {
        tenantData = null,
        children
    } = props;

    const dispatch = useDispatch();
    const themeContext = React.useContext(DashThemeContext);
    const recreateTheme = themeContext?.recreateTheme;

    useEffect(() => {
        if (!tenantData) {
            // No data to process
            return;
        }

        // Process tenant images for panel settings
        if (tenantData.tenantImages) {
            const logos = {
                ...(tenantData.tenantImages.horizontal_logo?.original && { 
                    horizontalLogo: tenantData.tenantImages.horizontal_logo.original 
                }),
                ...(tenantData.tenantImages.squared_logo?.original && { 
                    squaredLogo: tenantData.tenantImages.squared_logo.original 
                }),
                ...(tenantData.tenantImages.banner?.original && { 
                    loginBackground: tenantData.tenantImages.banner.original 
                })
            };
            dispatch(DASH_REDUX_ACTIONS.setPanelSettings(logos));
        }

        // Process tenant settings for theme
        if (tenantData.tenantSettings && recreateTheme) {
            recreateTheme(tenantData.tenantSettings);
        }

        // Store tenant data for persistence (without user authentication)
        const publicAuthData = {
            auth: {
                tenantImages: tenantData.tenantImages,
                tenantSettings: tenantData.tenantSettings,
                tenant: tenantData.tenant,
            },
            systemValues: tenantData.systemValues
        };

        AuthPersistenceService.saveAuth(publicAuthData);

    }, [tenantData]);

    return <></>;
}

export default GlobalTenantWrapper;