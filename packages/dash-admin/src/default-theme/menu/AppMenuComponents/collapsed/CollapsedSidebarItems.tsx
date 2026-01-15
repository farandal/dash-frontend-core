import { List } from '@mui/material';
import { IMenuItem } from '../interfaces';
import CollapsedSidebarItem from './CollapsedSidebarItem';
import { SidebarPosition } from '../../AppSidebarMaterial';

export interface ICollapsedSidebarItems {
	items: IMenuItem[];
	navSize: 'large' | 'small';
	navExpanded: boolean;
	level: number;
	sidebarPosition?: SidebarPosition;
}

const CollapsedSidebarItems: React.FC<ICollapsedSidebarItems> = ({ items, navSize, navExpanded, level, sidebarPosition = "left" }) => {
	return (
		<List className={'sidebar-list sidebar-collapsed-menu'} component='nav'>
			{items.map((item, index) => {
				return <CollapsedSidebarItem 
									level={level} 
									item={item} 
									key={index} 	
									navSize={navSize}
									navExpanded={navExpanded}
									sidebarPosition={sidebarPosition}
				/>
			})}
		</List>
	);
};

export default CollapsedSidebarItems;
