import { IMenuItem } from './interfaces';

const getItem = (item: IMenuItem): IMenuItem => {
	/*return {
      key: item.key,
      icon: item.icon,
      children: item.children,
      label: item.label,
      type: item.type,
      group: item.group,
      model: item.model,
      txtLabel: item.txtLabel
    };*/
	return item;
};

export default getItem;
