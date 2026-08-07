import { DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect, useCallback } from "react";
import { Loading, useRecordContext } from "react-admin";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import MUISimpleJsonTable from "../misc/MuiSimpleJsonTable";
import { useSubscriptionPlanFormats } from "../../contexts/SubscriptionPlanFormatsProvider";
import { 
    Box, 
    Switch, 
    FormControlLabel, 
    TextField, 
    Typography, 
    Paper, 
    Grid, 
    Chip,
    InputAdornment,
    Collapse,
    Divider
} from "@mui/material";
import { priceFormatter } from 'dash-utils';

/**
 * PlanAddonsSettings Component
 * 
 * A dynamic form component for managing subscription plan add-ons with pricing.
 * Add-ons are specific integrations (marketplaces, POS systems) that can be
 * individually enabled/disabled per subscription plan, with configurable prices per currency.
 * 
 * Usage:
 * - In edit mode: Renders form fields for each add-on defined in subscription_plans.addon_formats
 *   with toggle switch and price inputs for each currency
 * - In view mode: Displays the current add-ons with their prices as a table
 * - In create mode: Renders form fields with default values
 * 
 * Add-on naming convention:
 * - marketplace_{name}: Marketplace integrations (e.g., marketplace_ubereats)
 * - pos_{name}: Point of Sale integrations (e.g., pos_transbank)
 */

interface AddonFormat {
    id: string;
    group: string;
    tab: string;
    attribute: string;
    label: string;
    visible: boolean;
    required: boolean;
    type: 'boolean' | 'integer' | 'string' | 'select';
    editable: boolean;
    rules: string;
    default_value: any;
    description?: string;
    service_class?: string | null;
    icon?: string;
    prices?: Record<string, number>;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    addons?: Record<string, boolean>;
    addon_prices?: Record<string, Record<string, number>>;
    flow_addon_items?: Record<string, number>;
    [key: string]: any;
}

// Default currencies - should match backend config
const AVAILABLE_CURRENCIES = ['CLP', 'USD'];
const DEFAULT_CURRENCY = 'CLP';

// Currency display configuration
const CURRENCY_CONFIG: Record<string, { symbol: string; decimals: number; name: string }> = {
    CLP: { symbol: '$', decimals: 0, name: 'Chilean Peso' },
    USD: { symbol: '$', decimals: 2, name: 'US Dollar' },
};

/**
 * Single addon row component with toggle and price inputs
 */
interface AddonRowProps {
    addonId: string;
    entry: AddonFormat;
    plan?: SubscriptionPlan;
    mode: 'edit' | 'create' | 'view';
}

const AddonRow: React.FC<AddonRowProps> = ({ addonId, entry, plan, mode }) => {
    const { control, setValue, watch } = useFormContext();
    
    // Watch the enabled state for this addon
    const isEnabled = watch(`addons.${addonId}`) ?? entry.default_value ?? false;
    
    // Watch prices for this addon
    const addonPrices = watch(`addon_prices.${addonId}`) ?? plan?.addon_prices?.[addonId] ?? {};

    const handleToggle = useCallback((checked: boolean) => {
        setValue(`addons.${addonId}`, checked, { shouldDirty: true });
        
        // Initialize prices if enabling for the first time
        if (checked && Object.keys(addonPrices).length === 0) {
            const defaultPrices: Record<string, number> = {};
            AVAILABLE_CURRENCIES.forEach(currency => {
                defaultPrices[currency] = entry.prices?.[currency] ?? 0;
            });
            setValue(`addon_prices.${addonId}`, defaultPrices, { shouldDirty: true });
        }
    }, [addonId, addonPrices, entry.prices, setValue]);

    const handlePriceChange = useCallback((currency: string, value: string) => {
        const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
        setValue(`addon_prices.${addonId}.${currency}`, numericValue, { shouldDirty: true });
    }, [addonId, setValue]);

    const formatPrice = (price: number, currency: string): string => {
        return priceFormatter(price, currency);
    };

    const isReadOnly = mode === 'view';

    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                mb: 2, 
                borderLeft: isEnabled ? '4px solid #4caf50' : '4px solid #e0e0e0',
                transition: 'border-color 0.3s'
            }}
        >
            <Grid container spacing={2} sx={{
                alignItems: "flex-start"
            }}>
                {/* Toggle and Label */}
                <Grid item xs={12} md={4}>
                    <Controller
                        name={`addons.${addonId}`}
                        control={control}
                        defaultValue={entry.default_value ?? false}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={field.value ?? false}
                                        onChange={(e) => {
                                            field.onChange(e.target.checked);
                                            handleToggle(e.target.checked);
                                        }}
                                        disabled={isReadOnly}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: "medium"
                                        }}>
                                            {entry.icon && <span style={{ marginRight: 8 }}>{entry.icon}</span>}
                                            {entry.label}
                                        </Typography>
                                        {entry.description && (
                                            <Typography variant="caption" sx={{
                                                color: "text.secondary"
                                            }}>
                                                {entry.description}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                        )}
                    />
                    {entry.service_class && (
                        <Chip 
                            label="Has Service Class" 
                            size="small" 
                            variant="outlined" 
                            sx={{ mt: 1 }}
                        />
                    )}
                </Grid>

                {/* Price Inputs - Show when enabled */}
                <Grid item xs={12} md={8}>
                    <Collapse in={isEnabled}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {AVAILABLE_CURRENCIES.map((currency) => {
                                const config = CURRENCY_CONFIG[currency];
                                const currentPrice = addonPrices[currency] ?? entry.prices?.[currency] ?? 0;
                                
                                return (
                                    <Controller
                                        key={currency}
                                        name={`addon_prices.${addonId}.${currency}`}
                                        control={control}
                                        defaultValue={currentPrice}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={`Price (${currency})`}
                                                type="text"
                                                size="small"
                                                disabled={isReadOnly}
                                                sx={{ width: 150 }}
                                                value={formatPrice(field.value ?? 0, currency)}
                                                onChange={(e) => handlePriceChange(currency, e.target.value)}
                                                helperText={config.name}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                {config.symbol}
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                );
                            })}
                        </Box>
                        {plan?.flow_addon_items?.[addonId] && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    mt: 1,
                                    display: 'block'
                                }}>
                                Flow Item ID: {plan.flow_addon_items[addonId]}
                            </Typography>
                        )}
                    </Collapse>
                </Grid>
            </Grid>
        </Paper>
    );
};

const PlanAddonsSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const plan: SubscriptionPlan = useRecordContext();
    const formContext = useFormContext();
    const { setValue, watch } = formContext;
    
    // Watch for changes in addons to ensure it remains an object
    const currentAddons = watch('addons');
    const currentAddonPrices = watch('addon_prices');
    
    useEffect(() => {
        // Fix: Ensure addons is always an object, not an array
        if (Array.isArray(currentAddons)) {
            console.warn('PlanAddonsSettings: Detected addons as array, converting to object');
            setValue('addons', { ...currentAddons });
        }
    }, [currentAddons, setValue]);

    useEffect(() => {
        // Fix: Ensure addon_prices is always an object, not an array
        if (Array.isArray(currentAddonPrices)) {
            console.warn('PlanAddonsSettings: Detected addon_prices as array, converting to object');
            setValue('addon_prices', {});
        } else if (!currentAddonPrices && plan?.addon_prices && !Array.isArray(plan.addon_prices)) {
            // Initialize addon_prices from plan if not set
            setValue('addon_prices', plan.addon_prices);
        } else if (!currentAddonPrices || (typeof currentAddonPrices === 'object' && Object.keys(currentAddonPrices).length === 0)) {
            // Initialize as empty object if not set
            setValue('addon_prices', {});
        }
    }, [currentAddonPrices, plan, setValue]);
    
    useWatch({
        control: formContext.control
    });

    const { addonFormats: formatsData, loading } = useSubscriptionPlanFormats();

    if (loading) return <Loading />;

    const formats = (formatsData?.formats as AddonFormat[]) || [];
    const visibleFormats = formats.filter((entry) => entry.visible !== false);

    // Group addons by tab
    const groupedByTab = visibleFormats.reduce((acc, entry) => {
        const tab = entry.tab || 'General';
        if (!acc[tab]) acc[tab] = [];
        acc[tab].push(entry);
        return acc;
    }, {} as Record<string, AddonFormat[]>);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Plan Add-ons Configuration
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 3
                }}>
                Enable add-ons and set prices per currency. Prices are in the smallest currency unit (e.g., cents for USD, pesos for CLP).
            </Typography>

            {Object.entries(groupedByTab).map(([tabName, entries]) => (
                <Box key={tabName} sx={{ mb: 4 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: "bold",
                            mb: 2
                        }}>
                        {tabName}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {entries.map((entry) => {
                        const addonId = entry.attribute 
                            ? entry.attribute.replace('addons.', '') 
                            : entry.id;
                        return (
                            <AddonRow
                                key={addonId}
                                addonId={addonId}
                                entry={entry}
                                plan={plan}
                                mode="edit"
                            />
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

const PlanAddonsSettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const formContext = useFormContext();
    const { setValue, watch } = formContext;
    
    // Watch for changes in addons to ensure it remains an object
    const currentAddons = watch('addons');

    useEffect(() => {
        // Fix: Ensure addons is always an object, not an array
        if (Array.isArray(currentAddons)) {
            console.warn('PlanAddonsSettings: Detected addons as array, converting to object');
            setValue('addons', { ...currentAddons });
        }
    }, [currentAddons, setValue]);

    // Initialize addon_prices structure for create mode
    useEffect(() => {
        const addonPrices = watch('addon_prices');
        // Fix: Ensure addon_prices is always an object, not an array
        if (Array.isArray(addonPrices)) {
            console.warn('PlanAddonsSettings: Detected addon_prices as array, converting to object');
            setValue('addon_prices', {});
        } else if (!addonPrices) {
            setValue('addon_prices', {});
        }
    }, [setValue, watch]);
    
    useWatch({
        control: formContext.control
    });

    const { addonFormats: formatsData, loading } = useSubscriptionPlanFormats();

    if (loading) return <Loading />;

    const formats = (formatsData?.formats as AddonFormat[]) || [];
    const visibleFormats = formats.filter((entry) => entry.visible !== false);

    // Group addons by tab
    const groupedByTab = visibleFormats.reduce((acc, entry) => {
        const tab = entry.tab || 'General';
        if (!acc[tab]) acc[tab] = [];
        acc[tab].push(entry);
        return acc;
    }, {} as Record<string, AddonFormat[]>);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Plan Add-ons Configuration
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 3
                }}>
                Enable add-ons and set prices per currency. Prices are in the smallest currency unit.
            </Typography>

            {Object.entries(groupedByTab).map(([tabName, entries]) => (
                <Box key={tabName} sx={{ mb: 4 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: "bold",
                            mb: 2
                        }}>
                        {tabName}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {entries.map((entry) => {
                        const addonId = entry.attribute 
                            ? entry.attribute.replace('addons.', '') 
                            : entry.id;
                        return (
                            <AddonRow
                                key={addonId}
                                addonId={addonId}
                                entry={entry}
                                mode="create"
                            />
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

const PlanAddonsSettingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const plan: SubscriptionPlan = useRecordContext();
    
    const { addonFormats: formatsData, loading } = useSubscriptionPlanFormats();

    const formatPrice = (price: number, currency: string): string => {
        return priceFormatter(price, currency);
    };

    if (loading) return <Loading />;

    const formats = (formatsData?.formats as AddonFormat[]) || [];
    const visibleFormats = formats.filter((entry) => entry.visible !== false);

    // Group addons by tab
    const groupedByTab = visibleFormats.reduce((acc, entry) => {
        const tab = entry.tab || 'General';
        if (!acc[tab]) acc[tab] = [];
        acc[tab].push(entry);
        return acc;
    }, {} as Record<string, AddonFormat[]>);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Plan Add-ons
            </Typography>

            {Object.entries(groupedByTab).map(([tabName, entries]) => (
                <Box key={tabName} sx={{ mb: 3 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: "bold",
                            mb: 2
                        }}>
                        {tabName}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {entries.map((entry) => {
                        const addonId = entry.attribute 
                            ? entry.attribute.replace('addons.', '') 
                            : entry.id;
                        const isEnabled = plan?.addons?.[addonId] ?? false;
                        const addonPrices = plan?.addon_prices?.[addonId] ?? {};
                        const flowItemId = plan?.flow_addon_items?.[addonId];
                        
                        return (
                            <Paper 
                                key={addonId}
                                elevation={0}
                                sx={{ 
                                    p: 2, 
                                    mb: 1, 
                                    backgroundColor: isEnabled ? 'action.selected' : 'background.default',
                                    borderLeft: isEnabled ? '4px solid #4caf50' : '4px solid #e0e0e0',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {entry.icon && <span style={{ marginRight: 8 }}>{entry.icon}</span>}
                                            {entry.label}
                                        </Typography>
                                        <Chip 
                                            label={isEnabled ? 'Enabled' : 'Disabled'} 
                                            size="small" 
                                            color={isEnabled ? 'success' : 'default'}
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Box>
                                    
                                    {isEnabled && (
                                        <Box sx={{ textAlign: 'right' }}>
                                            {AVAILABLE_CURRENCIES.map((currency) => {
                                                const price = addonPrices[currency] ?? 0;
                                                return (
                                                    <Typography key={currency} variant="body2">
                                                        {currency}: {formatPrice(price, currency)}
                                                    </Typography>
                                                );
                                            })}
                                            {flowItemId && (
                                                <Typography variant="caption" sx={{
                                                    color: "text.secondary"
                                                }}>
                                                    Flow ID: {flowItemId}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

/**
 * Main PlanAddonsSettings component
 * Renders the appropriate sub-component based on the form mode (edit, view, create)
 */
const PlanAddonsSettings: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
    method, 
    attribute, 
    resourceConfig 
}) => {
    switch (method) {
        case "edit":
            return <PlanAddonsSettingsEdit 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "view":
            return <PlanAddonsSettingsView 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "create":
            return <PlanAddonsSettingsCreate 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "list":
            return null;
        default:
            return null;
    }
};

export default PlanAddonsSettings;
