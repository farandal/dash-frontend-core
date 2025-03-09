import { ICollapsableSidebarMenu } from '../interfaces';
import { useDispatch } from 'react-redux';
import { memo, useEffect, useState } from 'react';
import isCurrentPath from 'dash-admin/src/hooks/isCurrentPath';
import { useLocation, useNavigate } from 'react-router';
import {
	Collapse,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import SidebarItem from './SidebarItem';

/** @ts-ignore */
import clickSound from '@app/assets/sounds/click2.mp3?string';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import DASHAppConstants from 'dash-constants';

const CollapsableSidebarMenu = ({
	item,
	navExpanded,
	navSize,
	level
}: ICollapsableSidebarMenu) => {
	const loc = useLocation();
	const dispatch = useDispatch();

	const [isCurrent, setCurrent] = useState(isCurrentPath(loc.pathname, item));

	const [localOpen, setLocalOpen] = useState<boolean>(
		isCurrentPath(loc.pathname, item),
	);
	
	/* This hook is to open the menu on load onñy, memo state will not rerender this twice */
	useEffect(() => {
		setLocalOpen(isCurrentPath(loc.pathname, item));
	}, []);

	const navigate = useNavigate();

	const playClick = () => {

		if(!!DASHAppConstants.system.UI_SOUNDS) {
		const audio = new Audio(clickSound);
		audio.load();
		audio.play();
		}
	};


	const updatePageState = () => {
		const newPageState: IPageState = {
			title: item?.label,
			icon: item?.icon,
			subTitle: item?.group,
		};
		dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
	};


	return (
		<>
			<ListItemButton
				selected={localOpen}
				className={'sidebar-list-menu-item'}
				
				onClick={(e) => {
					
					playClick();
					setLocalOpen(!localOpen);

					if((e.target as any)?.localName === "svg") 	return;
				
					// TODO: if main clickable prop, then...
					if (!isCurrentPath(loc.pathname, item)) {
						updatePageState();
						navigate(item.model);
					}
				}}
			>
				<ListItemIcon>{item.icon && item.icon}</ListItemIcon>
				{/* Este es el submenu con la barra lateral expandida */}
				{navExpanded && (
					<ListItemText
						disableTypography
						primary={<Typography>{item.label}</Typography>}
					/>
				)}
				{navExpanded &&
					(localOpen ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />)}
			</ListItemButton>
			{navExpanded && (
				<Collapse in={localOpen} timeout='auto'>
					<List className={'sidebar-list-sub'} disablePadding>
						{item.children?.map((item, index) =>
							item ? (
								item.children ? (
									<CollapsableSidebarMenu
										navExpanded={navExpanded}
										navSize={navSize}
										item={item}
										key={index}
										level={level+1}
									/>
								) : (
									<SidebarItem
										level={level}
										navExpanded={navExpanded}
										navSize={navSize}
										showIcon={false}
										item={item}
										key={index}
									/>
								)
							) : null,
						)}
					</List>
				</Collapse>
			)}
		</>
	);
};

const MemoizedCollapsableSidebarMenu = memo(CollapsableSidebarMenu, (prev, next) => {
	return prev === next;
});

export default MemoizedCollapsableSidebarMenu as typeof CollapsableSidebarMenu;
