

import TenantImage from "kt-ecommerce/src/components/TenantImage";
import TenantMarketplaceAssociation from "kt-ecommerce/src/components/TenantMarketplaceAssociation";
import TenantPointOfSaleAssociation from "kt-ecommerce/src/components/TenantPointOfSaleAssociation";
import TenantSettings from "kt-ecommerce/src/components/TenantSettings";
import { ColorPallete, ThemePallete } from "kt-utils";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectArrayInput, SelectInput } from "react-admin";
/**
 * Schema for Tenancy Tenant management
 * API Endpoint: /api/tenancy/tenants
 * 
 * This schema defines the fields for managing tenants within a tenancy account.
 * Unlike the system tenant schema which includes all fields, this focuses on
 * the essential fields a tenancy admin can manage.
 */
const tenancyTenantSchema: IDashAutoAdminAttribute[] = [
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
      label: 'Email',
      attribute: 'email',
      type: String,
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
      inList:false,
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
    

    {
      tab: "Marketplaces",
      label: "Marketplaces",
      attribute: 'systemMarketplace', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      inCreate: false,
      component: TenantMarketplaceAssociation,
    },

    {
      tab: "Puntos de Venta",
      label: "Puntos de Venta",
      attribute: 'systemPointOfSale', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      inCreate: false,
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
    inCreate: false,
      component: TenantSettings,
    },


    {
      tab: "Imágenes",
      label: "Banner",
      attribute: 'banner_images', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      listAttribute: 'banner_url', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
      type: String,
      custom: true,
      inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
      inCreate: false,
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
       inCreate: false,
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
       inCreate: false,
      component: TenantImage,
      componentProps: {
        endpoint: '/upload-squared-logo'
      }
    },




];

export default tenancyTenantSchema;
