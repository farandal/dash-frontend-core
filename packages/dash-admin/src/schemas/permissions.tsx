import {IDashAutoAdminAttribute} from 'dash-auto-admin'

enum Guards {
	Web = 'web',
}

enum Levels {
	'Level 1' = '1',
	'Level 2' = '2',
	'Level 3' = '3',
}

const permissionSchema: IDashAutoAdminAttribute[] = [
	/*{
      attribute: 'id',
      type: Number
    },*/
	{
		attribute: 'name',
		type: String,
	},
	{
		attribute: 'guard_name',
		type: Guards,
	},
	{
		attribute: 'group',
		type: String,
	},
	{
		attribute: 'route_name',
		type: String,
	},
	{
		attribute: 'level',
		type: Levels,
	},
	/* {
      attribute: 'scope',
      type: String
    }*/
];

export default permissionSchema;
