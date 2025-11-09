import React, {
	// FormEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { PopoverLayout } from '@/components/HeadlessUI'
import { Link, useLocation } from 'react-router-dom'

// constants
import { MenuItemTypes } from '@/constants/menu'

// helpers
import { findAllParent, findMenuItem, getMenuItemFromURL } from '../helpers/menu'

// hooks
import { useLogoTheme } from '@/hooks'

interface SubMenus {
	item: MenuItemTypes
	linkClassName?: string
	subMenuClassNames?: string
	activeMenuItems?: Array<string>
	toggleMenu?: (item: any, status: boolean) => void
	className?: string
}

const MenuItemWithChildren = ({
	item,
	// linkClassName,
	// subMenuClassNames,
	activeMenuItems,
	toggleMenu,
}: SubMenus) => {
	const [open, setOpen] = useState<boolean>(activeMenuItems!.includes(item.key))
	const { isDark } = useLogoTheme()

	useEffect(() => {
		setOpen(activeMenuItems!.includes(item.key))
	}, [activeMenuItems, item])

	const toggleMenuItem = () => {
		const status = !open
		setOpen(status)
		if (toggleMenu) toggleMenu(item, status)
		return false
	}
	const PopoverToggle = () => {
		return (
			<>
				<Link
					to=""
					className={`nav-link flex justify-between ${activeMenuItems!.includes(item['key']) ? 'active' : ''
						}`}
					aria-expanded={open}
					onClick={toggleMenuItem}
					data-menu-key={item['key']}
					style={{ color: item.isTitle && !isDark ? '#f3f4f6' : '' }}
				>
					<span className="menu-text"> {item.label}</span>
					{!item.badge && (
						<span className="fa-solid fa-angle-down ms-2 align-middle" />
					)}
				</Link>
				{item.isDivider && <hr className="-mx-2 my-2"></hr>}
			</>
		)
	}

	return (
		<PopoverLayout
			toggler={<PopoverToggle />}
			placement={item.parentKey ? 'right-start' : 'bottom-start'}
			togglerClass={`w-full nav-item after:absolute hover:after:-bottom-10 after:inset-0`}
		>
			<ul
				className={`nav-link ${open ? 'active' : ''
					} origin-center -mt-0 transition-all bg-white rounded-lg shadow-lg border p-2 w-48 space-y-1.5 absolute`}
			>
				{(item.children || []).map((child, idx) => {
					return (
						<React.Fragment key={idx}>
							{child.children ? (
								<MenuItemWithChildren
									item={child}
									toggleMenu={toggleMenu}
									activeMenuItems={activeMenuItems}
									subMenuClassNames="sub-menu"
									linkClassName={activeMenuItems!.includes(child.key) ? 'active' : ''}
								/>
							) : (
								<MenuItem
									item={child}
									className={'nav-item'}
									linkClassName={activeMenuItems!.includes(child.key) ? 'active' : ''}
								/>
							)}
						</React.Fragment>
					)
				})}
			</ul>
		</PopoverLayout>
	)
}

const MenuItem = ({ item, className, linkClassName }: SubMenus) => {
	return (
		<li className={className}>
			<MenuItemLink item={item} className={linkClassName} />
		</li>
	)
}

const MenuItemLink = ({ item, className }: SubMenus) => {
	const { isDark } = useLogoTheme()

	return (
		<Link
			className={`nav-link side-nav-link-ref ${className}`}
			to={item.url!}
			target={item.target}
			data-menu-key={item.key}
			style={{ color: item.isTitle && !isDark ? '#f3f4f6' : '' }}
		>
			{item.icon ? (
				<div className="flex items-center -ms-1.5">
					<span className="bg-blue-600/10 flex justify-center items-center w-8 h-8 shadow rounded me-3">
						{item.icon}
					</span>
					<div className="flex-grow-1">{item.label}</div>
				</div>
			) : (
				<div className="flex flex-wrap justify-between">{item.label}</div>
			)}
		</Link>
	)
}

/**
 * Renders the application menu
 */
interface AppMenuProps {
	menuItems: MenuItemTypes[]
}

const AppMenu = ({ menuItems }: AppMenuProps) => {
	const [activeMenuItems, setActiveMenuItems] = useState<string[]>([])

	const location = useLocation()
	const menuRef = useRef(null)

	const toggleMenu = (menuItem: MenuItemTypes, show: boolean) => {
		if (show) {
			setActiveMenuItems([
				menuItem['key'],
				// ...findAllParent(menuItems, menuItem),
			])
		}
	}
	/**
	 * activate the menuitems
	 */
	const activeMenu = useCallback(() => {	
		const trimmedURL = location?.pathname?.replaceAll(
			"",
			''
		)
		const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL);

		if (matchingMenuItem) {
			const activeMt = findMenuItem(menuItems, matchingMenuItem.key)
			if (activeMt) {
				setActiveMenuItems([
					activeMt['key'],
					...findAllParent(menuItems, activeMt),
				])
			}
		}
		}, [location.pathname, menuItems])

	useEffect(() => {
		if (menuItems && menuItems.length > 0) activeMenu()
	}, [activeMenu, menuItems])

	return (
		<ul
			className="navbar-nav flex gap-x-3 items-center justify-center"
			ref={menuRef}
			id="main-side-menu"
		>
			{(menuItems || []).map((item, idx) => {
				return (
					<React.Fragment key={idx}>
						{item.children ? (
							<MenuItemWithChildren
								item={item}
								toggleMenu={toggleMenu}
								activeMenuItems={activeMenuItems}
								linkClassName="nav-link"
								subMenuClassNames=""
							/>
						) : (
							<MenuItem
								item={item}
								linkClassName={`${activeMenuItems.includes(item.key) ? 'active' : ''}`}
								className={'nav-item'}
							/>
						)}
					</React.Fragment>
				)
			})}
		</ul>
	)
}

export default AppMenu
