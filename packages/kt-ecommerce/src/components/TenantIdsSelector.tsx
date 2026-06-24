import {
    Box,
    Chip,
    Checkbox,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Loading, SearchInput, useEditContext } from "react-admin";

import { List } from "react-admin";
import { TopToolbar } from "react-admin";
import { useListContext } from "react-admin";
import { useRecordContext } from "react-admin";
import { PaginationComponent } from "dash-components";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";


const TenantsListWithCheckboxes = ({ selectedIds, onToggle }: { selectedIds: Set<string>; onToggle: (id: string) => void }) => {
    const { data, isLoading } = useListContext();

    if (isLoading) return <Loading />;
    if (!data) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {data.map((item: any) => (
                <Box
                    key={item.id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                        "&:hover": { backgroundColor: "#f9f9f9" },
                    }}
                >
                    <Checkbox
                        checked={selectedIds.has(item.id)}
                        onChange={() => onToggle(item.id)}
                        size="small"
                    />
                    <Box sx={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export const TenantIdsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
   attribute, resourceConfig }) => {

    const { record } = useEditContext<any>();
    const { setValue } = useFormContext();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize with record's tenant_ids
    useEffect(() => {
        if (record?.id) {
            const ids = Array.isArray(record?.tenant_ids) ? record.tenant_ids : [];
            setSelectedIds(new Set(ids));
            setValue("tenant_ids", ids);
        }
    }, [record?.id, setValue]);

    const toggleTenant = (id: string) => {
        setSelectedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            // Sync to form field immediately
            setValue("tenant_ids", Array.from(updated));
            return updated;
        });
    };

    return (<>
        {record && (
            <>
                <Box sx={{ width: "100%" }}>
                    <List
                        disableSyncWithLocation
                        resource='tenancy/tenants'
                        actions={<TopToolbar>
                           <Box sx={{
                            display: 'flex',
                            width: 'stretch',
                            flexWrap: 'wrap',
                           }}>
                            <b>Tiendas</b>
                            <SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth size="small" />
                            </Box>
                        </TopToolbar>}
                        pagination={<PaginationComponent />}
                        storeKey='tenancy-tenants'
                        empty={<Loading />}
                        emptyWhileLoading={true}
                    >
                        <TenantsListWithCheckboxes selectedIds={selectedIds} onToggle={toggleTenant} />
                    </List>
                </Box>
            </>
        )}

    </>);
};


export const TenantIdsSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({
   attribute, resourceConfig }) => {

    const { setValue } = useFormContext();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setValue("tenant_ids", []);
    }, [setValue]);

    const toggleTenant = (id: string) => {
        setSelectedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            setValue("tenant_ids", Array.from(updated));
            return updated;
        });
    };

    return (
        <>
            <b>Tiendas</b>
            <Box sx={{ width: "100%" }}>
                <List
                    disableSyncWithLocation
                    resource='tenancy/tenants'
                    actions={<TopToolbar>
                       <Box sx={{
                        display: 'flex',
                        width: 'stretch',
                        flexWrap: 'wrap',
                       }}>
                        <b>Tiendas</b>
                        <SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth size="small" />
                        </Box>
                    </TopToolbar>}
                    pagination={<PaginationComponent />}
                    storeKey='tenancy-tenants'
                    empty={<Loading />}
                    emptyWhileLoading={true}
                >
                    <TenantsListWithCheckboxes selectedIds={selectedIds} onToggle={toggleTenant} />
                </List>
            </Box>
        </>
    );
};

export const TenantIdsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({attribute,
   resourceConfig }) => {

    const record = useRecordContext<any>();

    return (<>
        {record && (
                <Box sx={{ width: "100%" }}>
                    {record.tenants?.map((tenant: any) => (
                        <Chip
                            key={tenant.id}
                            label={tenant.name}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
        )}
    </>);
};

const TenantIdsSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantIdsSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "create":
      return <TenantIdsSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
    case "list":
      return <TenantIdsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default TenantIdsSelector;
