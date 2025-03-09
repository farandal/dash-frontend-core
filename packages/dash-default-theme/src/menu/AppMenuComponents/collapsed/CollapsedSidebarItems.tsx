import { List } from '@mui/material';
import { IMenuItem } from '../interfaces';
import CollapsedSidebarItem from './CollapsedSidebarItem';

export interface ICollapsedSidebarItems {
	items: IMenuItem[];
	navSize: 'large' | 'small';
	navExpanded: boolean;
	level: number;
}

const CollapsedSidebarItems: React.FC<ICollapsedSidebarItems> = ({ items,  navSize,navExpanded,level }) => {
	return (
		<List className={'sidebar-list sidebar-collapsed-menu'} component='nav'>
			{items.map((item, index) => {
				return <CollapsedSidebarItem 
												level={level} 
												item={item} 
												key={index} 	
												navSize={navSize}
												navExpanded={navExpanded} 
							/>
			})}
		</List>
	);
};

export default CollapsedSidebarItems;
