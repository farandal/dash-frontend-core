import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { IMenuItem } from '../interfaces';
import {
	ListItemButton,
	ListItemButtonProps,
	ListItemIcon,
	ListItemText,
	Menu,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch } from 'react-redux';
import isCurrentPath from 'dash-admin/src/hooks/isCurrentPath';

export interface ICollapsedSidebarItem {
	item: IMenuItem;
	navSize: 'large' | 'small';
	navExpanded: boolean;
	level: number;
}

export interface ISidebarItem extends ListItemButtonProps, PropsWithChildren {
	item: IMenuItem;
	showIcon?: boolean;
	showText?: boolean;
	navExpanded?: boolean;
	navSize: 'large' | 'small';
	level: number,
}

const SidebarItem: FC<ISidebarItem> = (props) => {
	const {
		item,
		showIcon = true,
		showText = true,
		children,
		navExpanded,
		navSize,
		level,
		...rest
	} = props;

	const loc = useLocation();

	const [isCurrent, setCurrent] = useState(isCurrentPath(loc.pathname, item));

	useEffect(() => {
		setCurrent(isCurrentPath(loc.pathname, item));
	}, [loc]);

	const navigate = useNavigate();

	const dispatch = useDispatch();

	const updatePageState = () => {
		const newPageState: IPageState = {
			title: item?.label,
			icon: item?.icon,
			subTitle: item?.group,
		};
		dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
	};

	return (
		<ListItemButton
			{...rest}
			selected={isCurrent}
			onClick={(e) => {
				e.stopPropagation();

				if ((e.target as any)?.localName === 'svg') return;

				if (!isCurrentPath(loc.pathname, item)) {
					updatePageState();
					navigate(item.to);
				}
			}}
		>
			{showIcon && <ListItemIcon>{item.icon && item.icon}</ListItemIcon>}
			{(showText && level > 0) && (
				<ListItemText>{item.label}</ListItemText>
			)}
			{children}
		</ListItemButton>
	);
};

const CollapsedSidebarItem = ({
	item,
	navSize,
	navExpanded,
	level
}: ICollapsedSidebarItem) => {
	//const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	//const buttonRef = useRef(null);
	//const open = Boolean(anchorEl);
	const hovering = useRef<boolean>(false);
	const timeoutDuration = 20;
	let timeout;

	const [open, setOpen] = useState(false);

	/*
	const closePopover = () => {
		if (hovering.current === true) return;
		//setAnchorEl(null);
		setOpen(false)
	};

	const onMouseEnter = (event: any) => {
		console.log('onMouseEnter');
		clearTimeout(timeout);
		if (open) return;
		//setAnchorEl(event.currentTarget);
		hovering.current = true;
		setOpen(true)
	};

	const onMouseLeave = (e: any) => {
		//if (!open) return;
		timeout = setTimeout(() => closePopover(), timeoutDuration);
	};

	const handlePopoverEnter = (event: React.MouseEvent<HTMLElement>) => {
		hovering.current = true;
		setOpen(true)
	};

	const handlePopoverLeave = (event: React.MouseEvent<HTMLElement>) => {
		hovering.current = false;
		timeout = setTimeout(() => closePopover(), timeoutDuration);
	};
*/

	const openMenu = () => {
		setOpen(true);
	};
	const closeMenu = () => {
		setOpen(false);
	};

	return item.children ? (
		<>
			<SidebarItem
				//ref={buttonRef}
				aria-owns={open ? 'menu-' + item.key : undefined}
				aria-haspopup='true'
				onMouseEnter={openMenu}
				onMouseLeave={closeMenu}
				item={item}
				showText={false}
				navSize={navSize}
				navExpanded={navExpanded}
				level={level}
			>
				<ul
					id={'menu-' + item.key}
					key={'menu-' + item.key}
					className={`dropdown ${open ? 'show' : ''}`}
				>
					{item.children?.map((item, index) => {
						return (
							<SidebarItem
								navSize={navSize}
								navExpanded={navExpanded}
								level={level+1}
								//onMouseEnter={handlePopoverEnter}
								//onMouseLeave={handlePopoverLeave}
								item={item}
								key={index}
							/>
						);
					})}
				</ul>
			</SidebarItem>
		</>
	) : (
		<SidebarItem item={item} navSize={navSize} navExpanded={navExpanded} level={level} />
	);
};

export default CollapsedSidebarItem;
