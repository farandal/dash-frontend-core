import {
    useGetList
} from "react-admin";

//import ProductViewMockup from "../components/Mockups/ProductView";
import moment from "moment";

import { Loading } from "react-admin";
import ProductView from "./ProductView";

import React from "react";
import { IAppResourceConfig } from "kt-utils/src/interfaces";
moment.locale("es-es");

export const beforeSubmit = (data) => {
    //dispatch(SUDO_REDUX_ACTIONS.loading(true));
    try {
        if (data.metadata_mappings_request) {
            data.metadata_mappings_request = data.metadata_mappings_request.filter((ele) => ele !== null);
        }
    } catch (e) {
        console.error("ProductResource.beforeSubmit", e);
    }


    let urlsArray: any = [];
    if (data.updatedUrls) {

        Object.keys(data.updatedUrls).forEach((_TenantMarketplaceId) => {
            if (data.updatedUrls[_TenantMarketplaceId] && data.updatedUrls[_TenantMarketplaceId].trim() !== "") {
                urlsArray.push({ marketplace_id: _TenantMarketplaceId.substring(1), url: data.updatedUrls[_TenantMarketplaceId] })
            }
        });
    }
    delete data.updatedUrls;
    data.urls = urlsArray;

    let priceArray: any = [];
    if (data.updatedPrices) {
        Object.keys(data.updatedPrices).forEach((_priceListId) => {

            //object[_PriceListId.substring(1)] = data.prices[_PriceListId];
            if (data.updatedPrices[_priceListId] && parseInt(data.updatedPrices[_priceListId]) > 0) {
                priceArray.push({ pricelist_id: _priceListId.substring(1), price: data.updatedPrices[_priceListId] })
            }
        });
    }
    delete data.updatedPrices;
    data.prices = priceArray;

    let stockArray: any = [];
    if (data.updatedStocks) {

        Object.keys(data.updatedStocks).forEach((_stockTypeId) => {
            //object[_PriceListId.substring(1)] = data.prices[_PriceListId];
            if (data.updatedStocks[_stockTypeId] && parseInt(data.updatedStocks[_stockTypeId]) > 0) {
                stockArray.push({ stock_type_id: _stockTypeId.substring(1), stock: data.updatedStocks[_stockTypeId] })
            }
        });
    }
    delete data.updatedStocks;
    data.stocks = stockArray;

    if (data.products?.length > 0) {
        let products: any = data.products.map(prod => ({ quantity: prod.quantity, product_id: prod.product.id }));
        data.products = products;
    }

    return data;
}
interface IProductResourceShow {
    resourceConfig: IAppResourceConfig;
}
export const ProductResourceShow: React.FC<IProductResourceShow> = ({ resourceConfig, ...props }) => {

    const { data, isLoading } = useGetList(
        'ecommerce/currency',
        {
            //pagination: { page: 1, perPage: 1000 },
            meta: { queryOptions: { refetchOnWindowFocus: false } }
        }
    );

    return !isLoading ? <ProductView currency={data} /> : <Loading />


}