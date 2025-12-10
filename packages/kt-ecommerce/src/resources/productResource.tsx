import { IDashAutoAdminResourceConfig } from "dash-auto-admin";

import React, {  } from "react";

import Inventory from "@mui/icons-material/Inventory";
import AttachMoney from "@mui/icons-material/AttachMoney";
import Archive from "@mui/icons-material/Archive";
import Label from "@mui/icons-material/Label";
import Image from "@mui/icons-material/Image";
import History from "@mui/icons-material/History";
import Tag from "@mui/icons-material/Tag";
import {DASHAppConstants} from "dash-constants";
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { Category } from "../interfaces";
import productSchema from "../schemas/product";

// Direct imports for components used in resource configs
// (React.lazy doesn't work for component references in resource configs)
import ExportProductsButton from "../components/Misc/ExportProductsButton";
import { ProductResourceShow } from "../components/Product/ProductResourceHelper";
import ProductListBulkActions from "../components/Product/ProductListBulkActions";
import CategoryFilter from "../components/Product/Filters/CategoryFilter";

/*
- PACKS FEATURE: PENDING.
- METADATA FEATURE: PENDING.
*/

const Producto = Inventory as unknown as React.FC;
const Precios = AttachMoney as unknown as React.FC;
const Stocks = Archive as unknown as React.FC;
const Marca = Label as unknown as React.FC;
const Galeria = Image as unknown as React.FC;
//const Packs = Inventory2 as unknown as React.FC;
const Historial = History as unknown as React.FC;
const Metadata = Tag as unknown as React.FC;

const productResource: IDashAutoAdminResourceConfig =
{
    roles: [DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
   
    showComponent: (resourceConfig) => (
        <ProductResourceShow resourceConfig={resourceConfig} />
    ),
    customToolbarElements: (props) => {
        return (
            <ExportProductsButton
                resourceName={"ecommerce/product/export"}
                {...props}
            />
        );
    },
    icon: <Producto />,
    model: "ecommerce/product",
    group: "Productos",
    label: "Productos",
    schema: productSchema,
    exporter: false,
    
    dataGridProps: {
        rowClick:false,
        stickyHeader: false,
        bulkActionButtons:  <ProductListBulkActions resourceConfig={{ model: "ecommerce/product" }}  />,
    },
    listProps: {
        perPage: 20,
      
        sort: { field: 'id', order: 'ASC' },
        storeKey: false,
        queryOptions: {
            meta: {
                load_prices: true,
                show_disabled: true
            }
        }

    }, 
    paginationProps: {
        rowsPerPageOptions: [20, 50, 100, 200],
    },
   
    resetSelectedIdsOnLoad: true,
    closeDrawerAfterSave: true,
    showNotifyAfterSubmit: false,
    showDialogAfterSubmit: true,
    redirectAfterCreate: "view",
    redirectAfterUpdate: false,
    refreshAfter: true,
    isFormData: true, // Enable FormData for image uploads

    postFormatter: (data) => {
     
        /* TODO: METADATA */
        if (data.metadata_items) {
            data.metadata_items = data.metadata_items.filter((data) => {
                if (data.value) {
                    return true;
                }
            });
        } else {
            data.metadata_items = [];
        }

        let priceArray: any = [];
        if (data.updatedPrices) {
            Object.keys(data.updatedPrices).forEach(
                (undersocredPriceListId) => {
                    if (
                        data.updatedPrices[undersocredPriceListId] &&
                        parseInt(
                            data.updatedPrices[undersocredPriceListId]
                        ) > 0
                    ) {
                        priceArray.push({
                            pricelist_id:
                                undersocredPriceListId.substring(1),
                            price: data.updatedPrices[
                                undersocredPriceListId
                            ],
                        });
                    }
                }
            );
        }
        delete data.updatedPrices;
        data.prices = priceArray;

        let stockArray: any = [];
        if (data.updatedStocks) {
            Object.keys(data.updatedStocks).forEach(
                (undersocredStockTypeId) => {
                    if (
                        data.updatedStocks[undersocredStockTypeId] &&
                        parseInt(
                            data.updatedStocks[undersocredStockTypeId]
                        ) > 0
                    ) {
                        stockArray.push({
                            stock_type_id:
                                undersocredStockTypeId.substring(1),
                            stock: data.updatedStocks[
                                undersocredStockTypeId
                            ],
                        });
                    }
                }
            );
        }
        delete data.updatedStocks;
        data.stocks = stockArray;

        if (data.products?.length > 0) {
            let products: any = data.products.map((prod) => ({
                quantity: prod.quantity,
                product_id: prod.product.id,
            }));
            data.products = products;
        }

        // Format modifier_group_ids if needed
        if (data.modifier_groups_ids) {
            data.modifier_groups_ids = Array.isArray(data.modifier_groups_ids)
                ? data.modifier_groups_ids.map(id => typeof id === 'object' ? id.id : id)
                : [];
        }

        return data;
    },
    formPostFormatter: (params, form) => {
        // params is already transformed by postFormatter - don't call it again!
        const transformed = params;
        
        // Clear the form to rebuild it properly
         /*@ts-ignore*/
        Array.from((form as any).keys()).forEach(key => form.delete(key));

        // Append all simple fields
        Object.keys(transformed).forEach(key => {
            const value = transformed[key];
            
            // Skip complex objects and arrays that need special handling
            if (['prices', 'stocks', 'products', 'metadata_items', 'products_file', 'gallery_images', 'category_ids', 'modifier_groups_ids'].includes(key)) {
                return;
            }
            
            // Append simple values
            if (value !== null && value !== undefined) {
                // Convert booleans to 1/0 for Laravel
                if (typeof value === 'boolean') {
                    form.append(key, value ? '1' : '0');
                } else {
                    form.append(key, value.toString());
                }
            }
        });

        // Handle prices array properly
        if (transformed.prices && Array.isArray(transformed.prices) && transformed.prices.length > 0) {
            transformed.prices.forEach((price: any, index: number) => {
                form.append(`prices[${index}][pricelist_id]`, price.pricelist_id.toString());
                form.append(`prices[${index}][price]`, price.price.toString());
            });
        }

        // Handle stocks array properly  
        if (transformed.stocks && Array.isArray(transformed.stocks) && transformed.stocks.length > 0) {
            transformed.stocks.forEach((stock: any, index: number) => {
                form.append(`stocks[${index}][stock_type_id]`, stock.stock_type_id.toString());
                form.append(`stocks[${index}][stock]`, stock.stock.toString());
            });
        }

        // Handle products array (for packs)
        if (transformed.products && Array.isArray(transformed.products) && transformed.products.length > 0) {
            transformed.products.forEach((product: any, index: number) => {
                form.append(`products[${index}][product_id]`, product.product_id.toString());
                form.append(`products[${index}][quantity]`, product.quantity.toString());
            });
        }

        // Handle metadata_items array - only send if not empty
        if (transformed.metadata_items && Array.isArray(transformed.metadata_items) && transformed.metadata_items.length > 0) {
            transformed.metadata_items.forEach((item: any, index: number) => {
                form.append(`metadata_items[${index}][metadata_format_id]`, item.metadata_format_id.toString());
                form.append(`metadata_items[${index}][value]`, item.value.toString());
            });
        }

        // Handle category_ids array - only send if not empty
        const categoryIds = transformed.category_ids || params.category_ids;
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
            categoryIds.forEach((id: any) => {
                form.append('category_ids[]', id.toString());
            });
        }

        // Handle modifier_groups_ids array - only send if not empty
        const modifierGroupIds = transformed.modifier_groups_ids || params.modifier_groups_ids;
        if (modifierGroupIds && Array.isArray(modifierGroupIds) && modifierGroupIds.length > 0) {
            modifierGroupIds.forEach((id: any) => {
                form.append('modifier_groups_ids[]', id.toString());
            });
        }

        // Handle products_file (file upload)
        if (params.products_file) {
            if (params.products_file?.file) {
                form.append("products_file", params.products_file.file as Blob);
            } else if (params.products_file?.rawFile) {
                form.append("products_file", params.products_file.rawFile as Blob);
            }
        }

        // Handle gallery images for product creation (auto-creates gallery)
        if (params.gallery_images && params.gallery_images.length > 0) {
            params.gallery_images.forEach((image: File) => {
                form.append("gallery_images[]", image);
            });
        }

        return form;
    },
    groupsData: [
        { name: "Producto", icon: <Producto /> },
        { name: "Precios", icon: <Precios /> },
        { name: "Stocks", icon: <Stocks /> },
        { name: "Marca", icon: <Marca /> },
        { name: "Galería", icon: <Galeria /> },
        { name: "Historial", icon: <Historial /> },
        /*{ name: "Packs", icon: <Packs /> },*/
         { name: "Metadata", icon: <Metadata /> },
    ],

    menu: [
        {
            title: "Listado de productos",
            redirect: "/ecommerce/product",
        },
        {
            title: "🗑",
            redirect: "/ecommerce/product/trash",
        },
    ],
    mainAction: {
        title: "Crear producto",
        fn: "redirect",
        // type: "ghost",
        mode: "create",
        redirect: "create",
    },

    filterWithSubmit: false,
    filterButtonPosition: 'buttons-toolbar', // or 'filters-container'
    referenceFilters: [
        {
            id: "Nombre",
            label: "Nombre",
            source: "name",
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
        {
            id: "description",
            label: "Descripción",
            source: "description",
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
        {
            id: "sku",
            label: "SKU",
            source: "sku",
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
        // Categories filter with checkboxes - FIXED
        /*{
            id: "categories_checkbox",
            label: "Categorías",
            source: "category_ids", // Changed from "categories" to "category_ids"
            reference: null,
            optionText: null,
            alwaysOn: true,
            referenceComponent: CategoryFilterCheckboxes,
            fieldProps: {
                multiple: true,
                minOptions: 15,
                searchResults: 100,
                resource: "ecommerce/category", // This fetches categories
                viewAttribute: "breadcrumbed_name",
                valueKeyId: "id",
                renderText: (option: Category, caller: string) => {
                    if (!option) return '';
                    return option.breadcrumbed_name || option.name || '';
                },
                isOptionEqualToValue: (option: Category, value: Category) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                },
                queryFilter: "q",
                filter: { flat: true, pagination: false },
                placeholder: "Seleccionar categorías...",
                minSearch: 1,
                timerSearch: 300,
                maxHeight: 400,
                showSelectAll: true,
                showSelectedCount: true,
                fullWidth: true,
            },
        },*/
        // Original categories filter (dropdown version) - UPDATED to use only fieldProps
           {
        id: "categories",
        label: "Categorías (Dropdown)",
        source: "category_ids",
        reference: null,
        optionText: null,
        alwaysOn: true,
       
        referenceComponent: CategoryFilter,
        fieldProps: {
            multiple: true,
            minOptions: 15,        // 🔥 ENHANCED: Show at least 15 options
            searchResults: 100,    // 🔥 ENHANCED: Allow up to 100 total results
            resource: "ecommerce/category",
            viewAttribute: "breadcrumbed_name",
            valueKeyId: "id",
            renderText: (option: Category, caller: string) => {
                if (!option) return '';
                return option.breadcrumbed_name || option.name || '';
            },
            isOptionEqualToValue: (option: Category, value: Category) => {
                if (!option || !value) return false;
                return option.id === value.id;
            },
            queryFilter: "q",
            filter: { flat: true, pagination: false },
            placeholder: "Buscar categorías...",
            minSearch: 1,          // 🔥 ENHANCED: Search after just 1 character
            timerSearch: 300,      // 🔥 ENHANCED: Faster search response
            filterWithSubmit: true,
        },
    },

        /*
        // Status filter
        {
            id: "is_enabled",
            label: "Estado",
            source: "is_enabled",
            reference: null,
            optionText: null,
            alwaysOn: true,
            referenceComponent: SelectInput,
            fieldProps: {
                choices: [
                    { id: true, name: 'Habilitado' },
                    { id: false, name: 'Deshabilitado' },
                ],
                emptyText: "Todos",
                emptyValue: "",
            },
        },
        // Pack filter
        {
            id: "is_pack",
            label: "Es Pack",
            source: "is_pack",
            reference: null,
            optionText: null,
            alwaysOn: true,
            referenceComponent: SelectInput,
            fieldProps: {
                choices: [
                    { id: true, name: 'Sí' },
                    { id: false, name: 'No' },
                ],
                emptyText: "Todos",
                emptyValue: "",
            },
        },*/
    ],
    drawer: true,
    drawerOptions: {
        show: true,
        view: true,
        edit: false,
        create: false,
    },
    search: true,

    saveButtonAlwaysEnabled: true,
    processErrors: true,
}

export default productResource;
