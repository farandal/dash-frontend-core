import BrandMapperANT from "../components/Brand/BrandMapperANT";
import CustomImageInput from 'dash-admin/src/components/misc/CustomImageInput';
import Avatar from "dash-admin/src/components/avatar/Avatar";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { ImageInput } from "react-admin";
import TenantIdsSelector from "../components/TenantIdsSelector";

const brandSchema: IDashAutoAdminAttribute[] = [

    {
        tab: "Marca",
        attribute: 'public_id',
        label: 'Rol social',
        type: String
    },

    {
        tab: "Marca",
        attribute: 'name',
        label: 'Nombre comercial',
        type: String
    },

    {
        tab: "Marca",
        attribute: 'contact_name',
        label: 'Nombre contacto',
        type: String
    },
    {
        tab: "Marca",
        attribute: 'contact_email',
        label: 'Email contacto',
        type: String
    },

    {
        tab: "Marca",
        attribute: 'contact_phone',
        label: 'Teléfono contacto',
        type: String
    },

    {
        tab: "Marca",
        attribute: 'image',
        listAttribute: 'image_url',
        type: String,
        custom: true,
        component: Avatar,
        inList: false,
        label: "Logo",
        processor: 'File',
        //validate: (password: string) => (password && password.length >= 6 ? undefined : <div>Password is too short</div>)
    },

    {
        tab: "Marca",
        attribute: 'is_primary',
        label: 'Principal',
        type: Boolean,
        processor: "Boolean"
    },

   /* {
        tab: "Mapeador",
        attribute: 'input_brand_mappings',
        label: 'Mapeos',
        type: String,
        custom: true,
        component: BrandMapperANT,
        inList: false,
        inShow: true,
        inEdit: true
    }*/

         {   // TODO: if is_internal, do not allow this input
                  attribute: 'tenant_ids',
                  label: 'Tenants',
                  type: Array,
                  inList: false,
                  custom: true,
                  component: TenantIdsSelector
                
              },
        

];

export default brandSchema;
