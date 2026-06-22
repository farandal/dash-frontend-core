import { Box, Checkbox } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
    Loading,
    SearchInput,
    useEditContext,
    List,
    TopToolbar,
    useListContext,
} from "react-admin";
import { PaginationComponent } from "dash-components";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

/**
 * Entitlement editor for a SystemCheckoutGateway: which TenancyAccounts may use this provider.
 * Renders a searchable, paginated Datagrid with checkboxes that sync directly to form field.
 */
const TENANCY_RESOURCE = "system/tenancy";

// Renders paginated tenancy list with selectable checkboxes
const TenancyListWithCheckboxes = ({ selectedIds, onToggle }: { selectedIds: Set<string>; onToggle: (id: string) => void }) => {
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
                        <div style={{ fontWeight: 500 }}>{item.legal_name || item.public_name}</div>
                        <div style={{ fontSize: "0.85em", color: "#666" }}>{item.slug}</div>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export const SystemCheckoutGatewayTenancyAssociator: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const { record } = useEditContext<any>();
    const { setValue } = useFormContext();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize with record's tenancy_ids
    useEffect(() => {
        if (record?.id) {
            const ids = Array.isArray(record?.tenancy_ids) ? record.tenancy_ids : [];
            setSelectedIds(new Set(ids));
            setValue("tenancy_ids", ids);
        }
    }, [record?.id, setValue]);

    const toggleTenancy = (id: string) => {
        setSelectedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            // Sync to form field immediately
            setValue("tenancy_ids", Array.from(updated));
            return updated;
        });
    };

    return (
        <>
            {record && (
                <>
                    <h1>Cuentas (Tenancies) habilitadas para este proveedor</h1>
                    <Box sx={{ width: "100%" }}>
                        <List
                            disableSyncWithLocation
                            resource={TENANCY_RESOURCE}
                            actions={<TopToolbar></TopToolbar>}
                            filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}
                            pagination={<PaginationComponent />}
                            storeKey="system-checkout-gateway-tenancies"
                            empty={<Loading />}
                            emptyWhileLoading={true}
                        >
                            <TenancyListWithCheckboxes selectedIds={selectedIds} onToggle={toggleTenancy} />
                        </List>
                    </Box>
                </>
            )}
        </>
    );
};

export default SystemCheckoutGatewayTenancyAssociator;
