import { ICollapsableSidebarMenu } from '../interfaces';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Circle from '@mui/icons-material/Circle';
import { useLocation, useNavigate } from 'react-router';

import { useDispatch } from 'react-redux';

import { useEffect, useState } from 'react';

/** @ts-ignore */
import clickSound from '@app/assets/sounds/click2.mp3?string';
/** @ts-ignore */
import bubbleSound from '@app/assets/sounds/bubble.mp3?string';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import DASHAppConstants from 'dash-constants';
import isCurrentPath from 'dash-admin/src/hooks/isCurrentPath';

const SidebarItem = ({
	item,
	navExpanded,
	navSize,
	level,
	className,
	showIcon = true,
}: ICollapsableSidebarMenu) => {
	const navigate = useNavigate();
	const DefaultIcon = <Circle />;

	const loc = useLocation();

	const [isCurrent, setCurrent] = useState(isCurrentPath(loc.pathname, item));

	useEffect(() => {
		setCurrent(isCurrentPath(loc.pathname, item));
	}, [loc]);

	const playClick = () => {

		if(!!DASHAppConstants.system.UI_SOUNDS) {
		const audio = new Audio(clickSound);
		audio.load();
		audio.play();
		}
	};


	const dispatch = useDispatch();
	const updatePageState = () => {
		const newPageState: IPageState = {
			title: item?.label,
			icon: item?.icon,
			subTitle: item?.group,
		};
		dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
	};

	useEffect(() => {
		if (isCurrent === true) {
			updatePageState();
		}
	}, [isCurrent]);

	return (
		<ListItemButton
			selected={isCurrent}
			onClick={(e) => {

				playClick();
				updatePageState();

				if((e.target as any)?.localName === "svg") return;

				if (item?.to) {
					navigate(item.to);
				}
			}}
		>
			<ListItemIcon>{item?.icon || DefaultIcon}</ListItemIcon>
			{navSize !== "small" && <ListItemText>{item.label}</ListItemText>}
		</ListItemButton>
	);
};

export default SidebarItem;
