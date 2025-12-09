import TenantImage from "../components/TenantImage";
import TenantMarketplaceAssociation from "../components/TenantMarketplaceAssociation";
import TenantPointOfSaleAssociation from "../components/TenantPointOfSaleAssociation";
import TenantSettings from "../components/TenantSettings";
import ColorPallete from "kt-utilsColorPallete";
import ThemePallete from "kt-utilsThemePallete";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectArrayInput, SelectInput } from "react-admin";

const tenantSuperAdminSchema:IDashAutoAdminAttribute[] = [
    /*{
      attribute: 'id',
      type: Number
    },*/
    {
        tab: 'Datos',
      label: 'Nombre',
      attribute: 'name',
      type: String,
      readOnly: true
    },
    {
         tab: 'Datos',
      label: 'Rut',
      attribute: 'public_id',
      type: String,
      validate: (rut: string) => {
        if(!rut)
          throw new Error('El campo es requerido');
        else if(!rut.match(/^(\d{7,8}-[\dkK])$/g))
          throw new Error('Ingresar rut con guion');
      },
      readOnly: true
    },

    

    {
         tab: 'Datos',
      label: 'Descripción Corta',
      attribute: 'short_description',
      type: String,
      inList: false,
      validate: (value: string) => {
        if (value && value.length > 500) {
          throw new Error('La descripción corta no puede exceder 500 caracteres');
        }
      },
    },

    {
         tab: 'Datos',
      label: 'Descripción Larga',
      attribute: 'long_description',
      type: String,
      inList: false,
         fieldProps: {
      multiline: true,
    },
    slotProps: {
      multiline: true,
      fullWidth: true
    },
      validate: (value: string) => {
        if (value && value.length > 5000) {
          throw new Error('La descripción larga no puede exceder 5000 caracteres');
        }
      },
    },
   {
     tab: 'Datos',
      label: 'Monedas Disponibles',
      attribute: 'currency_ids',
      //listAttribute: 'name',
      type: 'ecommerce/currency.code',
      //type: Object,
      // TODO Agregar un filtro, solo para traer los roles de cliente.
      pagination: false,
      multiple: true,
      componentProps: {multiple:true},
      //custom: true,
      component: SelectArrayInput,
      //searchField: "subdomain"
    },

    {
     tab: 'Datos',
      label: 'Moneda Primaria',
      attribute: 'currency_primary_id',
      //listAttribute: 'name',
      type: 'ecommerce/currency.code',
      //type: Object,
      // TODO Agregar un filtro, solo para traer los roles de cliente.
      pagination: false,
      multiple: false,

      //componentProps: {multiple:false},
      //custom: true,
      component: SelectInput,
      //searchField: "subdomain"
    },
    /*{
      label: 'Teléfono de emergencia',
      attribute: 'emergency_phone',
      type: String,
      validate: (phone) => {
          let response = undefined; // undefined == true, o mensaje de error.
          if(!phone)
              response = 'El campo es requerido';
          else if(isNaN(phone))
              response = 'El campo tiene que ser numérico'
          else if (phone && phone.length < 8) {
              response = 'Minimo 8 caracteres';
          }

          return response;
      }
    },*/
    
    /*{
      attribute: 'tenant_id',
      listAttribute: 'tenant_id',
      //type: 'ecommerce/tenants.subdomain',
      type: Number,
      pagination: false,
      multiple: true,
      component: SelectInput,
      searchField: "subdomain"
    }*/
    /*{
      attribute: 'tenant_id',
      listAttribute: 'tenant_id',
      type: 'ecommerce/tenants.name',
      //type: Number,
      pagination: false,
      multiple: true,
      component: SelectInput,
      //inList: false
    },*/
    
    /*{
      label: 'Cliente Comercial',
      attribute: 'tenant_id',
      //listAttribute: 'tenant_ids',
      type: 'ecommerce/tenant.public_id',
      pagination: false,
      multiple: false,
      component: SelectInput,
      inList: false
    },*/

    {
      tab: "Marketplaces",
      label: "Marketplaces",
      attribute: 'systemMarketplace', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantMarketplaceAssociation,
    },

    {
      tab: "Puntos de Venta",
      label: "Puntos de Venta",
      attribute: 'systemPointOfSale', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantPointOfSaleAssociation,
    },
    // TODO, agregar settings
    {
      tab: "Configuración",
      label: "Configuración",
      attribute: 'settings', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantSettings,
    },

/*
     {
      tab: "Imágenes",
      label: "Paleta de colores",
      attribute: 'settings', 
      type: String,
      custom: true,
      inList: false,
      component: ThemePallete
    },
*/

    {
      tab: "Imágenes",
      label: "Banner",
      attribute: 'banner_images', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      listAttribute: 'banner_url', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantImage,
      componentProps: {
     
        endpoint: '/upload-banner'
      }
    },

    {
      tab: "Imágenes",
      label: "Logo Horizontal",
      attribute: 'horizontal_logo_images',
      listAttribute: 'horizontal_logo_url', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantImage,
      componentProps: {
        endpoint: '/upload-horizontal-logo'
      }
    },

     {
      tab: "Imágenes",
      label: "Logo Cuadrado",
      attribute: 'squared_logo_images', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      listAttribute: 'squared_logo_url',
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantImage,
      componentProps: {
        endpoint: '/upload-squared-logo'
      }
    },


/*
  {
    tab: "Datos contacto",
    label: 'Razón Social',
    attribute: 'public_name',
    type: String,
    inList: false
  },


  {
    tab: "Datos contacto",
    label: 'Dirección',
    attribute: 'address',
    type: String,
    inList: false
  },

  {
    tab: "Datos contacto",
    label: 'Teléfono',
    attribute: 'phone',
    type: String,
    inList: false
  },

  {
    tab: "Datos contacto",
    label: 'Teléfono Móvil',
    attribute: 'mobile',
    type: String,
    inList: false
  },


  {
    tab: "Datos contacto",
    label: 'Nombre del contacto',
    attribute: 'contact_name',
    type: String,
    inList: false
  },

  {
    tab: "Datos contacto",
    label: 'Email del contacto',
    attribute: 'contact_email',
    type: String,
    inList: false
  },

  {
    tab: "Datos contacto",
    label: 'Teléfono del contacto',
    attribute: 'contact_phone',
    type: String,
    inList: false
  }
*/

];

export default tenantSuperAdminSchema;
