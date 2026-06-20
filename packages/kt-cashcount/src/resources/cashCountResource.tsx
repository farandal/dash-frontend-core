
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import { AccountBalance, Close } from "@mui/icons-material";
import { SaveButton, useRecordContext } from "react-admin";
import {DASHAppConstants} from "dash-constants";

import IAppResourceConfig from "dash-admin/src/interfaces/IAppResourceConfig";
import { CashCountListBulkActions, cashCountSchema } from "..";
import ExportCashCountsButton from "../components/Export/ExportCashCountsButton";

const cashCountResource: IAppResourceConfig[] = [
    {
        group: "resource.groups.cashier",
        roles: [DASHAppConstants.system.TENANT_ROLE, "Cashier"],
        component: ResourceTemplate,
        model: "tab/cashcount",
        label: "resource.cashcount.label",
        schema: cashCountSchema,
        icon: <AccountBalance />,
        
        // Add custom toolbar elements for export functionality
        customToolbarElements: (props) => {
            return (
                <ExportCashCountsButton
                    resourceName={"tab/cashcount/export"}
                    {...props}
                />
            );
        },
        
        menu: [
            {
                title: "resource.cashcount.menu_list",
                redirect: "/tab/cashcount",
            },
          /* {
                title: "📊 Timeline",
                redirect: "/tab/cashcount/timeline",
            },*/
        ],
        
        mainAction: {
            title: "resource.cashcount.main_action",
            fn: "redirect",
            mode: "create",
            redirect: "create",
        },
        
        mutationMode: "pessimistic",
        drawer: true,
        drawerOptions: {
            edit: false,
            create: true,
            show: true,
            view: true,
        },
        
        formGroupMode: "tabs",
        
        listProps: {
            storeKey: false,
            empty: false,
            perPage: 25,
            sort: { field: 'period_end', order: 'DESC' },
            queryOptions: {
                meta: {
                    include_totals: true,
                    include_corrections: true,
                }
            }
        },
        
        paginationProps: {
            rowsPerPageOptions: [25, 50, 100],
        },
        
        saveButtonAlwaysEnabled: true,
        processErrors: true,
        exporter: false, // Disable default exporter since we have custom export
        
        dataGridProps: {
            //bulkActionButtons: false, // We could enable this for bulk export later
            bulkActionButtons: <CashCountListBulkActions />,
            stickyHeader: true,
        },
        
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: false, // Keep drawer open to show status changes
        showNotifyAfterSubmit: true,
        showDialogAfterSubmit: false,
        redirectAfterCreate: "edit", // Redirect to edit after creation to allow adjustments
        redirectAfterUpdate: "edit", // Stay in edit mode unless closed
        refreshAfter: true,
        topToolbarButtons: true,
       
        /*
        referenceFilters: [
            {
                id: 'status',
                label: 'Status',
                source: 'status',
                alwaysOn: true,
                reference: [
                    { id: 'draft', name: 'Draft' },
                    { id: 'preview', name: 'Preview' },
                    { id: 'closed', name: 'Closed' }
                ],
                optionText: 'name',
                referenceComponent: SelectInput,
                fieldProps: {
                    emptyText: "All Statuses",
                    emptyValue: "",
                },
            },
            {
                id: 'period_start_from',
                label: 'Period Start (From)',
                source: 'period_start_from',
                alwaysOn: false,
                reference: null,
                optionText: null,
                referenceComponent: DateInput,
                fieldProps: {
                    fullWidth: true,
                },
            },
            {
                id: 'period_end_to',
                label: 'Period End (To)',
                source: 'period_end_to',
                alwaysOn: false,
                reference: null,
                optionText: null,
                referenceComponent: DateInput,
                fieldProps: {
                    fullWidth: true,
                },
            },
        ],
        */
        
        // Post formatter to clean data before sending to backend
        postFormatter: (data) => {
            const cleanData = { ...data };
            
            // Remove read-only fields that shouldn't be sent to backend
            delete cleanData.period_start;
            delete cleanData.period_end;
            delete cleanData.currency_id;
            delete cleanData.system_total_sales;
            delete cleanData.system_total_amount;
            delete cleanData.system_total_tips;
            delete cleanData.period_duration;
            delete cleanData.has_corrections;
            delete cleanData.order_coverage_percentage;
            delete cleanData.created_at;
            delete cleanData.updated_at;
            delete cleanData.closed_at;
            
            // Remove custom field data
            delete cleanData.period_info;
            delete cleanData.totals;
            
            return cleanData;
        },
        
        // Custom save behavior based on status
        /*beforeSave: (data, record) => {
            // Add any pre-save logic here if needed
            return data;
        },*/
        
        // Custom redirect logic based on final status
        /*getRedirectAfterSave: (record, mode) => {
            if (record?.status === 'closed') {
                return 'show'; // Redirect to show view when closed
            }
            return 'edit'; // Stay in edit mode for preview/draft
        },*/

       
        AutoEditBottomToolbarElements: (resourceConfig) => {
            const CloseCashCountButton = () => {
                const record = useRecordContext();
                
                // Transform function to add close flag
                const transformWithClose = (data: any) => ({
                    ...data,
                    _action: 'close', // Add a flag to indicate this should close the cash count
                    status: 'closed'  // Explicitly set status to closed
                });
            
                // Only show if status allows closing
                const canClose = record?.status === 'preview';
                const isClosed = record?.status === 'closed';
                
                if (isClosed) {
                    return (
                        <SaveButton
                            label="Closed"
                            icon={<Close />}
                            disabled
                            variant="outlined"
                            color="success"
                            sx={{ ml: 1 }}
                        />
                    );
                }
                
                if (!canClose) return null;
                
                return (
                    <SaveButton
                        label="Close Cash Count"
                        icon={<Close />}
                        type="button"
                        transform={transformWithClose}
                        variant="contained"
                        color="warning"
                        sx={{ ml: 1 }}
                        mutationOptions={{
                            onSuccess: (data) => {
                                // Optional: Custom success handling
                                console.log('Cash count closed successfully', data);
                            }
                        }}
                    />
                );
            };
            
            return <CloseCashCountButton />;
        },
    },
];

export default cashCountResource;
