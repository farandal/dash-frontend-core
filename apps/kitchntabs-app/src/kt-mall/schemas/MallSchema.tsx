
import SearchableSelectChipsControlRecordContext from "dash-components/components/SearchableSelects/RASearchableSelectChipsRecordContext";
import SystemMallTenantAssociator from "../components/SystemMallTenantAssociator";
const MallSchema = [
    {
        tab: 'Basic Information',
        attribute: 'name',
        label: 'Mall Name',
        type: String,
        required: true,
    },
    {
        tab: 'Basic Information',
        attribute: 'description',
        label: 'Description',
        type: String,
        multiline: true,
        rows: 3,
    },
     {
        tab: 'Basic Information',
        attribute: 'slug',
        label: 'Slug',
        type: String,
        required: false,
        helperText: 'URL-friendly version of the name. Leave empty to auto-generate from name.',
    },
    {
        tab: 'Management',
        label: 'Manager Tenant',
        attribute: 'manager_tenant_id',
        listAttribute: 'manager_tenant',
        type: "system/tenant.name",
        custom: true,
        pagination: false,
        multiple: false,
        component: ({ method, attribute, resourceConfig }) => 
            <SearchableSelectChipsControlRecordContext
                method={method}
                attribute={attribute}
                resourceConfig={resourceConfig}
                defaultValues={null}
                resource={"system/tenant"}
                selectLabel={"Manager Tenant"}
                viewAttribute={'name'}
                valueKeyId={'id'}
                renderText={(option: any) => option && option.name ? `${option.name}` : ''}
                transformData={(value: any) => value}
                isOptionEqualToValue={(option: any, value: any) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                }}
                queryFilter={"q"}
                filter={{ pagination: false }}
                isMultiple={false}
            />,
        inList: false,
        inEdit: true,
        inCreate: true,
        inShow: true,
    },
    {
        tab: 'Contact Information',
        attribute: 'address',
        label: 'Address',
        type: String,
    },
    {
        tab: 'Contact Information',
        attribute: 'phone',
        label: 'Phone',
        type: String,
    },
    {
        tab: 'Contact Information',
        attribute: 'email',
        label: 'Email',
        type: String,
    },
    {
        tab: 'Contact Information',
        attribute: 'website',
        label: 'Website',
        type: String,
    },
    {
        tab: 'Settings',
        attribute: 'is_active',
        label: 'Active',
        type: Boolean,
        defaultValue: true,
    },
    {
        tab: 'Tenants',
        attribute: 'tenant_ids',
        type: String,
        custom: true,
        component: SystemMallTenantAssociator,
        inList: true,
        inCreate: true,
        inEdit: true,
        inShow: true
    }
];

export default MallSchema;
