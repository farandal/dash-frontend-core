import NotificationRenderer from "../components/Notifications/NotificationRenderer";
import { IDashAutoAdminAttribute } from "dash-auto-admin";


const notificationSchema:IDashAutoAdminAttribute[] = [
  {
    label: 'Fecha',
    attribute: 'created_at',
    fieldOptions: {showTime:true},
    type: Date
  }, 
  ,
  {
      label: 'Tipo',
      attribute: 'type',
      type: String,
      inList:false
    },

    {
      label: 'Clase',
      attribute: 'class',
      type: String,
      inList:true
    },

    {
      label: 'Título',
      attribute: 'notificationPayload.title',
      type: String
    },

    {
      label: 'Contenido',
      attribute: 'notificationPayload',
      type: String,
      custom: true,
      inList:false,
      component: NotificationRenderer
  },
   
  
];

export default notificationSchema;
