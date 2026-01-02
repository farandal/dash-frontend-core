import { PointOfSaleSync } from "../components/PointOfSale/PointOfSaleSync";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import pointOfSaleSchema from "../schemas/pointofsaleSchema";
import pricelistSchema from "../schemas/pricelist";

import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";
import { Route } from "react-router-dom";

import LocalOffer from "@mui/icons-material/LocalOffer";
import Bolt from "@mui/icons-material/Bolt";
import {DASHAppConstants} from "dash-constants";


const Icon = LocalOffer as unknown as React.FC;
const BoltIcon = Bolt as unknown as React.FC;

const pricelistResource: IDashAutoAdminResourceConfig =
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
  component: ResourceTemplate,
  trash: false,
  model: "ecommerce/pricelist",
  group: "resource.groups.products",
  label: "resource.ecommerce.pricelists.label",
  schema: pricelistSchema,
  icon: <Icon />,
  refreshAfter: true,
  closeDrawerAfterSave: true,
  showDialogAfterSubmit: true,

  menu: [
    {
      title: "resource.ecommerce.pricelists.menu_list",
      redirect: "/ecommerce/pricelist",
    },
/*{
      title: "🗑",
      redirect: "/ecommerce/pricelist/trash",
    },*/
  ],

  search: true,
  listViewButton: { enabled: false },
  /*listEditButton: {
      enabled: true,
      component: QuickEditButton,
      props: {
          icon: <BoltIcon />,
          label: "",
          resource: "ecommerce/pricelist/inline",
          navigation: "virtualhash",
          navigate: (id) => id,
          size: "small",
          color: "secondary",
      },
  },*/

  mainAction: {
    title: "resource.ecommerce.pricelists.main_action",
    mode: "create",
    fn: "virtualhash",
    redirect: "inline/create",
  },
  drawer: true,
  drawerOptions: {
    create: false,
    edit: false,
    view: true
  },

  //listDeleteButton: { enabled: false },

  formGroupMode: "tabs", // groups or tabs
  mutationMode: "pessimistic",
  postFormatter: (params) => {
    if (!params.output_pos_pricelist_mappings) {
      params.output_pos_pricelist_mappings = [];
    }
    if (params.output_pos_pricelist_mappings) {
      params.output_pos_pricelist_mappings =
        params.output_pos_pricelist_mappings.map(
          (item) => item.pointOfSalePricelist.id
        );
    }
    return params;
  },
  saveButtonAlwaysEnabled: true,
  processErrors: false,
  listProps: { storeKey: false }, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
  resetSelectedIdsOnLoad: true,
}

export default pricelistResource;