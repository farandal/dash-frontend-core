import { GridRenderCellParams } from "@mui/x-data-grid";
import { CellSettings } from "../Campaign/Products";
import { MarketplaceTag } from "../Misc";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";

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
