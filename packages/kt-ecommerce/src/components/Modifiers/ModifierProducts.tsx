import React, { useEffect, useState } from "react";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { Loading, useEditContext, useRecordContext, useShowContext, SelectInput, Datagrid, SearchInput, TextField, TopToolbar, useListContext, useRecordSelection} from "react-admin";
import { List } from "react-admin";
import { PaginationComponent } from "dash-components";
import { Box } from "@mui/material";
import { useController } from "react-hook-form";

const ListAutoSelectIds = ({ resource, selectedIdsFn }) => {
    const { data, isLoading } = useListContext();
    const gallery = useRecordContext();
    const [finalSelectedIds, setFinalSelectedIds] = useState([]);
    const [selectedIds, { select }] = useRecordSelection({ resource });

    useEffect(() => {

        if (isLoading) return;

        let _selectedIds = [];

        /*if (data?.length) {
            _selectedIds = [...new Set([..._selectedIds, ...data.map(p => p.id)])];
        }*/

        if (gallery && gallery?.products) {
            _selectedIds = [...new Set([..._selectedIds, ...gallery.products.map(p => p.id)])];
        }

        setFinalSelectedIds(_selectedIds);

    }, [data, gallery, isLoading]);

    useEffect(() => {
        if (!selectedIds || !selectedIds.length) return;

        if (selectedIdsFn) selectedIdsFn(selectedIds);
    }, [selectedIds]);


    useEffect(() => {
        if (!finalSelectedIds) return

        select(finalSelectedIds);
        //if (selectedIdsFn) selectedIdsFn(finalSelectedIds);

    }, [finalSelectedIds])

    return (
        <></>
    );
}


const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig, record }) => {
  

        const product_ids = useController({ name: "product_ids" });
        const [selectedProducts, setSelectedProducts] = useState(undefined);
        
    return <Box sx={{ width: "100%" }}>
    <List
        disableSyncWithLocation
        resource='ecommerce/product'
        /* This adds the filter button, but the problem this component is already in a form, cannot contain a nested form */
        //actions={<TopToolbar><FilterButton /></TopToolbar>}
        //filters={[<TextInput label="Buscar" source="q" />]}

        actions={<TopToolbar></TopToolbar>}
        filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}

        pagination={<PaginationComponent />}
        storeKey='ecommerce-gallery-products'
        empty={<Loading />}
        emptyWhileLoading={true}


    >
        <ListAutoSelectIds resource={'ecommerce/product'} selectedIdsFn={(p) => {
            product_ids.field.onChange(p);
        }} />
        <Datagrid

            bulkActionButtons={<></>}


        >
            <TextField source="id" />
            <TextField source="name" label='Nombre' />
            <TextField source="sku" label='SKU' />
        </Datagrid>
        {JSON.stringify(selectedProducts)}
    </List>
</Box>
};

const E: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { record, isPending } = useEditContext();
    if (!record || isPending) {
      return <Loading />;
    }
    return <EditComponent {...props} record={record} />;
};

const C: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    return <EditComponent {...props} record={null} />;
};

const V: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const { record, isPending } = useShowContext();
    if (!record || isPending) {
      return <Loading />;
    }
    return null;
};

const L: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    return null;
};

const ModifierProducts: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    switch (method) {
      case "edit":
        return <E attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "create":
        return <C attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "view":
        return <V attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "list":
        return <L attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      default:
        return null;
    }
};

export default ModifierProducts;