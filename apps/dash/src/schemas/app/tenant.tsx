import TenantMarketplaceAssociationForUser from "@app/components/ecommerce/TenantMarketplaceAssociationForUser";
import TenantPointOfSaleAssociationForUser from "@app/components/ecommerce/TenantPointOfSaleAssociationForUser";
import TenantSettings from "@app/components/ecommerce/TenantSettings";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectArrayInput, SelectInput } from "react-admin";

const tenantSchema:IDashAutoAdminAttribute[] = [
    /*{
      attribute: 'id',
      type: Number
    },*/
    {
      label: 'Nombre',
      attribute: 'name',
      type: String
    },
    {
      label: 'Rut',
      attribute: 'public_id',
      type: String,
      validate: (rut: string) => {
        if(!rut)
          throw new Error('El campo es requerido');
        else if(!rut.match(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$/g))
          throw new Error('Ingresar rut con puntos y guion');
      }
    },

    {
    
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

    {
      tab: "Marketplaces",
      label: "Marketplaces",
      attribute: 'systemMarketplace', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantMarketplaceAssociationForUser,
    },

    {
      tab: "Puntos de Venta",
      label: "Puntos de Venta",
      attribute: 'systemPointOfSale', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      component: TenantPointOfSaleAssociationForUser,
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

];

export default tenantSchema;
