import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SimpleCollapse } from '@/components/FrostUI'

// helpers
import { findAllParent, findMenuItem, getMenuItemFromURL } from '../helpers/menu'

// constants
import { MenuItemTypes } from '../constants/menu'

interface SubMenus {
	item: MenuItemTypes
	linkClassName?: string
	subMenuClassNames?: string
	activeMenuItems?: string[]
	toggleMenu?: (item: any, status: boolean) => void
	className?: string
}

const MenuItemWithChildren = ({
	item,
	linkClassName,
	subMenuClassNames,
	activeMenuItems,
	toggleMenu,
}: SubMenus) => {
	const [open, setOpen] = useState<boolean>(activeMenuItems!.includes(item.key))

	useEffect(() => {
		setOpen(activeMenuItems!.includes(item.key))
	}, [activeMenuItems, item])

	const toggleMenuItem = () => {
		const status = !open
		setOpen(status)
		if (toggleMenu) toggleMenu(item, status)
		return false
	}

	return (
		<li className={`nav-item`}>
			<div
				className={`${linkClassName} ${
					activeMenuItems!.includes(item['key']) ? 'active' : ''
				}`}
				aria-expanded={open}
				data-menu-key={item.key}
				onClick={toggleMenuItem}
			>
				{item.label}
				{!item.badge && (
					<span className="fa-solid fa-angle-down ms-auto  align-middle" />
				)}
			</div>
			<SimpleCollapse
				open={open}
				as="ul"
				classNames={subMenuClassNames + ' sub-menu'}
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
									className={`ms-3 nav-item`}
									linkClassName={
										activeMenuItems!.includes(child.key) ? 'active' : ''
									}
								/>
							)}
						</React.Fragment>
					)
				})}
			</SimpleCollapse>
		</li>
	)
}

const MenuItem = ({
	item,
	className,
	linkClassName,
}: SubMenus) => {
	return (
		<li className={`${className}`}>
			<MenuItemLink item={item} className={linkClassName} />
		</li>
	)
}

const MenuItemLink = ({
	item,
	className,
}: SubMenus) => {
	return (
		<Link
			to={item.url!}
			target={item.target}
			className={`nav-link side-nav-link-ref  ${className}`}
			data-menu-key={item.key}
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

const VerticalMenu = ({ menuItems }: AppMenuProps) => {
	const location = useLocation()

	const menuRef = useRef(null)

	const [activeMenuItems, setActiveMenuItems] = useState<Array<string>>([])

	/**
	 * toggle the menus
	 */
	const toggleMenu = (menuItem: MenuItemTypes, show: boolean) => {
		if (show) {
			setActiveMenuItems([
				menuItem['key'],
				// ...findAllParent(menuItems, menuItem),
			])
		}
	}

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

			setTimeout(function () {
				const activatedItem:any = document.querySelector(`#right-menu a[href="${trimmedURL}"]`);
			
				if (activatedItem != null) {
					const simplebarContent = document.querySelector(
						'#right-menu'
					)
				
					const offset = activatedItem!.offsetTop - 150
				
					scrollTo(simplebarContent, 100, 600)
					if (simplebarContent && offset > 100) {
						scrollTo(simplebarContent, offset, 600)
					}
				}
			}, 200)

			// scrollTo (Left Side Bar Active Menu)
			const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
				t /= d / 2
				if (t < 1) return (c / 2) * t * t + b
				t--
				return (-c / 2) * (t * (t - 2) - 1) + b
			}

			const scrollTo = (element: any, to: any, duration: any) => {
				const start = element.scrollTop,
					change = to - start,
					increment = 20
				let currentTime = 0
				const animateScroll = function () {
					currentTime += increment
					const val = easeInOutQuad(currentTime, start, change, duration)
					element.scrollTop = val
					if (currentTime < duration) {
						setTimeout(animateScroll, increment)
					}
				}
				animateScroll()
			}
		}
	}, [location.pathname, menuItems])

	useEffect(() => {
		if (menuItems && menuItems.length > 0) activeMenu()
	}, [activeMenu, menuItems])

	return (
		<>
			<ul
				className="navbar-nav flex flex-col gap-2 menu"
				ref={menuRef}
				id="main-side-menu"
			>
				{(menuItems || []).map((item, idx) => {
					return (
						<React.Fragment key={idx}>
							{item.isTitle ? (
								<li className="nav-item">{item.label}</li>
							) : (
								<>
									{item.children ? (
										<MenuItemWithChildren
											item={item}
											toggleMenu={toggleMenu}
											subMenuClassNames="space-y-2"
											activeMenuItems={activeMenuItems}
											linkClassName="nav-link"
										/>
									) : (
										<MenuItem
											item={item}
											linkClassName={`${activeMenuItems.includes(item.key) ? 'active' : ''}`}
											className={
												"nav-item"
											}
										/>
									)}
								</>
							)}
						</React.Fragment>
					)
				})}
			</ul>
		</>
	)
}

export default VerticalMenu
