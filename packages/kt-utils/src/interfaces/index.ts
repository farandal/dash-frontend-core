/**
 * KitchnTabs Shared Interfaces
 */

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { JSX } from 'react';

/**
 * Interface representing a menu item in the application layout
 */
export interface IAppLayoutMenuItem {
    /**
     * The display text of the menu item
     */
    title: string;

    /**
     * Optional click handler function for the menu item
     */
    onClick?: () => void;

    /**
     * Optional URL or path to redirect to when menu item is clicked
     */
    redirect?: string;

    /**
     * Optional icon identifier for the menu item
     */
    icon?: string;
}

/**
 * Extends the `IDashAutoAdminResourceConfig` interface to provide additional 
 * configuration options for an application resource.
 */
export interface IAppResourceConfig extends IDashAutoAdminResourceConfig {
    /** Custom prop used in domain ResourceLayout; adds JSX.Elements appended to the layout menu */
    navActions?: JSX.Element[];
    /** Determines if the resource should be hidden from the UI */
    hidden?: boolean;
    /** Specifies the position of the resource menu */
    resourceMenuPosition?: string;
    /** Determines if the resource menu should be disabled */
    resourceMenuDisabled?: boolean;
    /** Specifies a redirect path for the resource */
    redirect?: string;
}

/**
 * User interface
 */
export interface IUser {
    id: number;
    name: string;
    email: string;
    avatar_path?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    email_verified_at: string;
    roles: any[];
    tenant_id: string;
}

/**
 * System Marketplace interface
 */
export interface ISystemMarketplace {
    class: string;
    icon_path: string;
    icon_url: string;
    id: number;
    name: string;
    tenant_system_marketplace_id?: number;
}

/**
 * System Point of Sale interface
 */
export interface ISystemPointOfSale {
    class: string;
    icon_path: string;
    icon_url: string;
    id: number;
    name: string;
    tenant_system_point_of_sale_id?: number;
}

/**
 * Currency interface
 */
export interface ICurrency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    decimal_places: number;
}

/**
 * Tenant interface
 */
export interface ITenant {
    id: number;
    name: string;
    public_id: string;
    email: string;
    currencies?: ICurrency[];
    currency_primary_id?: number;
    currency_ids?: number[];
    systemMarketplaces: ISystemMarketplace[];
    systemPointOfSales: ISystemPointOfSale[];
    settings: any[];
}

/**
 * Cash Count interface
 */
export interface ICashCount {
    id: number;
    tenant_id: string;
    user_id: number;
    status: 'open' | 'closed' | 'pending_review';
    opening_amount: number;
    closing_amount: number;
    expected_amount: number;
    difference: number;
    notes?: string;
    opened_at: string;
    closed_at?: string;
    created_at: string;
    updated_at: string;
}
