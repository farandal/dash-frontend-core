import { GridRenderCellParams } from "@mui/x-data-grid";
import MarketplaceTag from "../../Misc/MarketplaceTag";
import MUISimpleJsonTable from "../../MuiSimpleJsonTable";
import CellSettings from "../Products/Grid/CellSettings";

const MarketPlacesCell = (props: GridRenderCellParams & { systemMarketplaces: any[] }) => {    

      const { systemMarketplaces } = props;
   
      const icons = props.row.campaign_marketplaces.map((item) => {
      const marketplace_product_url = item.pivot.product_extra_info.post_link;
      const marketplace = systemMarketplaces.find(
        (ele) => ele.tenant_system_marketplace_id == item.marketplace.tenant_system_marketplace_id
      );
    
      return (
        <a key={item.id} target="_blank" href={marketplace_product_url}>
          <MarketplaceTag
            marketplace={marketplace}
            noTitle={true}
          />
        </a>
      );
    });

    return (
      <div className="table-cell-container">
        <div className="table-cell-content">{icons}</div>
        <CellSettings row={props.row} field={props.field}>
          {props.row.campaign_marketplaces.map((item, index) => {
            const marketplace_extra_data = item.pivot.product_extra_info;
            const marketplace = systemMarketplaces.find(
              (ele) => ele.tenant_system_marketplace_id == item.marketplace.tenant_system_marketplace_id
            );
            
            return (
              <div key={`${item.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MarketplaceTag
                  marketplace={marketplace}
                  noTitle={true}
                />
                <MUISimpleJsonTable
                  ignore={["post_link"]}
                  tableData={marketplace_extra_data}
                  vertical={true}
                />
              </div>
            );
          })}
        </CellSettings>
      </div>
    );
  }

  export default MarketPlacesCell;
