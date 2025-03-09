import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import LogTxtFile from '../components/logs/LogFile';

const logSchema: IDashAutoAdminAttribute[] = [
	{
		tab: 'Log',
		label: 'Tipo',
		attribute: 'type',
		type: String,
	},
	{
		tab: 'Log',
		label: 'Fecha',
		attribute: 'date',
		type: Date,
	},
	{
		tab: 'Log',
		label: 'Nombre',
		attribute: 'name',
		type: String,
	},

	{
		tab: 'Log',
		label: 'Archivo',
		attribute: 'filepath',
		type: String, // Custom component para descargar el Log File
		inList: false, // Todo, visor de json
		custom: true,
		component: LogTxtFile,
	},

	/*{
      tab: "Log",
      label: "Data",
      attribute: 'json', 
      type: String,
      inList: false, // Todo, visor de json
      custom: true,
      component: LogViewer,
    },*/
];

export default logSchema;
