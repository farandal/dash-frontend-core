import { Row, Col } from "antd";

import { useRecordContext } from "react-admin";
import { useGetList, Loading, SelectInput, CheckboxGroupInput } from "react-admin";
import { FC } from "react";
import MarketplaceTags from "../../Misc/MarketplaceTags";
import { ICampaign } from "../../../interfaces";

export interface IPriceStock {
  hide_overwrite_prices?: boolean
}

export interface ICurrency {
  id: number,
  code: string,
  symbol: string,
  format: string
}

export interface IStockType {
  id: number,
  name: string,
  is_primary: boolean,
  in_internal: boolean,
}
export interface IPriceList {
  id: number,
  currency_id: number,
  name: string,
  is_primary: boolean,
  in_internal: boolean,
  currency: ICurrency
}
const PriceStock: FC<IPriceStock> = ({ hide_overwrite_prices, ...props }) => {

  const campaign: ICampaign = useRecordContext();

  const { data: stockType, isLoading: isLoadingStocks }: { data: IStockType[], isLoading: boolean } = useGetList(
    'ecommerce/stock_type',
    { },
    { refetchOnWindowFocus: false }
  );
  const { data: priceList, isLoading: isLoadingPrices }: { data: IPriceList[], isLoading: boolean } = useGetList(
    'ecommerce/pricelist',
    { },
    { refetchOnWindowFocus: false }
  );

  if (isLoadingPrices || isLoadingStocks)
    return <Loading />;

  return (
    <Row>
      <Col span={12}>
        <SelectInput fullWidth={true} label='Precio normal' emptyValue='' emptyText='Seleccione una opción' source='source_primary_pricelist_id' choices={priceList} />
        <br />
        <SelectInput fullWidth={true} label='Precio oferta' emptyValue='' emptyText='Seleccione una opción' source='source_sale_pricelist_id' choices={priceList} />
        <br />
        {!hide_overwrite_prices && <CheckboxGroupInput source='overwrite_prices' label='' choices={[{ id: 'true', name: 'Sobreescribir precios de productos actuales.' }]} />}

        {campaign?.status === "PUBLISHED" && !hide_overwrite_prices && <CheckboxGroupInput source='republish_products' label='' choices={[{ id: 'true', name: 'republicar productos en marketplaces.' }]} />}
      </Col>
      <Col span={12}>
        <SelectInput fullWidth={true} label='Stock' emptyValue='' emptyText='Seleccione una opción' source='source_stock_type_id' choices={stockType} />
      </Col>
    </Row>
  )
}

export default PriceStock;