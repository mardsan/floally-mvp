import React from 'react'
import { Route, RouteProps } from 'react-router-dom'

// components

// lazy load all the views

//auth
const Login = React.lazy(() => import('../pages/auth/Login'))
const Register = React.lazy(() => import('../pages/auth/Register'))
const RecoverPassword = React.lazy(
	() => import('../pages/auth/RecoverPassword')
)
const ConfirmMail = React.lazy(() => import('../pages/auth/ConfirmAccount'))

//Home Page
const HomePage = React.lazy(() => import('../pages/homePage'))

//landing Pages
const AppPage = React.lazy(() => import('../pages/landing/App'))
const SassClassicPage = React.lazy(() => import('../pages/landing/SassClassic'))
const SoftwarePage = React.lazy(() => import('../pages/landing/Software'))
const CoworkingPages = React.lazy(() => import('../pages/landing/CoWorking'))
const MarketingPages = React.lazy(() => import('../pages/landing/Marketing'))
const SassModernPages = React.lazy(() => import('../pages/landing/SassModern'))
const StartupPages = React.lazy(() => import('../pages/landing/Startup'))
const AgencyPages = React.lazy(() => import('../pages/landing/Agency'))
const CryptoPages = React.lazy(() => import('../pages/landing/Crypto'))
const PortfolioPages = React.lazy(() => import('../pages/landing/PortFolio'))

//PortfolioPages
const PortFolioGrid = React.lazy(
	() => import('../pages/portfolio/PortfolioGrid')
)
const PortfolioMasonry = React.lazy(
	() => import('../pages/portfolio/PortfolioMasonry')
)
const PortFolioItem = React.lazy(
	() => import('../pages/portfolio/PortfolioItems')
)

// contact page
const ContactPage = React.lazy(() => import('../pages/other/Contact'))

// Blog Pages
const BlogList = React.lazy(() => import('../pages/other/Blogs/BlogList'))
const BlogPost = React.lazy(() => import('../pages/other/Blogs/BlogPost'))

//otherPages
const CompanyPage = React.lazy(() => import('../pages/other/Company'))
const CareerPage = React.lazy(() => import('../pages/other/Career'))
const PricingPage = React.lazy(() => import('../pages/other/Pricing'))
const HelpPage = React.lazy(() => import('../pages/other/Help'))
const Dashboard = React.lazy(() => import('../pages/other/Dashboard'))
const Setting = React.lazy(() => import('../pages/other/Setting'))

export interface RoutesProps {
	path: RouteProps['path']
	name?: string
	element?: RouteProps['element']
	route?: any
	exact?: boolean
	icon?: string
	header?: string
	roles?: string[]
	children?: RoutesProps[]
}

// dashboards
const dashboardRoutes: RoutesProps[] = [
	{
		path: '/',
		name: 'Home',
		header: 'Navigation',
		element: <HomePage />,
		route: Route,
	},
]

const landingRoutes: RoutesProps[] = [
	{
		path: '/landing',
		name: 'Landing',
		icon: 'icon',
		children: [
			{
				path: '/landing/app',
				name: 'App',
				element: <AppPage />,
				route: Route,
			},
			{
				path: '/landing/sass-classic',
				name: 'Sass Classic',
				element: <SassClassicPage />,
				route: Route,
			},
			{
				path: '/landing/software',
				name: 'Software',
				element: <SoftwarePage />,
				route: Route,
			},
			{
				path: '/landing/coworking',
				name: 'Coworking',
				element: <CoworkingPages />,
				route: Route,
			},
			{
				path: '/landing/marketing',
				name: 'Marketing',
				element: <MarketingPages />,
				route: Route,
			},
			{
				path: '/landing/sass-modern',
				name: 'Sass Modern',
				element: <SassModernPages />,
				route: Route,
			},
			{
				path: '/landing/startup',
				name: 'Startup',
				element: <StartupPages />,
				route: Route,
			},
			{
				path: '/landing/agency',
				name: 'Agency',
				element: <AgencyPages />,
				route: Route,
			},
			{
				path: '/landing/crypto',
				name: 'Crypto',
				element: <CryptoPages />,
				route: Route,
			},
			{
				path: '/landing/portfolio',
				name: 'Portfolio',
				element: <PortfolioPages />,
				route: Route,
			},
		],
	},
]

// Portfolio Routes
const portfolioRoutes: RoutesProps[] = [
	{
		path: '/portfolio',
		name: 'Portfolio',
		children: [
			{
				path: '/pages/portfolio/grid',
				name: 'Portfolio Grid',
				element: <PortFolioGrid />,
				route: Route,
			},
			{
				path: '/pages/portfolio/masonry',
				name: 'Portfolio Masonry',
				element: <PortfolioMasonry />,
				route: Route,
			},
			{
				path: '/pages/portfolio/item',
				name: 'Portfolio Items',
				element: <PortFolioItem />,
				route: Route,
			},
		],
	},
]

// Blog
const blogroutes: RoutesProps[] = [
	{
		path: '/blogs',
		name: 'Blogs',
		children: [
			{
				path: '/pages/blogs/list',
				name: 'List',
				element: <BlogList />,
				route: Route,
			},
			{
				path: '/pages/blogs/post',
				name: 'Post',
				element: <BlogPost />,
				route: Route,
			},
		],
	},
]

// ui
const uiRoutes: RoutesProps[] = [
	{
		path: '/contact-us',
		name: 'Contact us',
		element: <ContactPage />,
	},
]

// auth
const authRoutes: RoutesProps[] = [
	{
		path: '/pages/account/login',
		name: 'Login',
		element: <Login />,
		route: Route,
	},
	{
		path: '/pages/account/register',
		name: 'Register',
		element: <Register />,
		route: Route,
	},

	{
		path: '/pages/account/forget-password',
		name: 'Forgot Password',
		element: <RecoverPassword />,
		route: Route,
	},
	{
		path: '/pages/account/confirm-account',
		name: 'Confirm Mail',
		element: <ConfirmMail />,
		route: Route,
	},
	{
		path: '/pages/setting',
		name: 'Setting',
		element: <Setting />,
		route: Route,
	},
	{
		path: '/pages/dashboard',
		name: 'Dashboard',
		element: <Dashboard />,
		route: Route,
	},
]

// public routes
const otherPublicRoutes = [
	{
		path: '/pages/company',
		name: 'Company',
		element: <CompanyPage />,
		route: Route,
	},
	{
		path: '/pages/career',
		name: 'Career',
		element: <CareerPage />,
		route: Route,
	},
	{
		path: '/pages/pricing',
		name: 'Pricing',
		element: <PricingPage />,
		route: Route,
	},
	{
		path: '/pages/help',
		name: 'Help',
		element: <HelpPage />,
		route: Route,
	},
]

// flatten the list of all nested routes
const flattenRoutes = (routes: RoutesProps[]) => {
	let flatRoutes: RoutesProps[] = []

	routes = routes || []
	routes.forEach((item: RoutesProps) => {
		flatRoutes.push(item)
		if (typeof item.children !== 'undefined') {
			flatRoutes = [...flatRoutes, ...flattenRoutes(item.children)]
		}
	})
	return flatRoutes
}

// All routes
const authProtectedRoutes = [
	...otherPublicRoutes,
	...blogroutes,
	...dashboardRoutes,
	...uiRoutes,
	...landingRoutes,
	...portfolioRoutes,
]

const publicRoutes = [...authRoutes]

const authProtectedFlattenRoutes = flattenRoutes([...authProtectedRoutes])
const publicProtectedFlattenRoutes = flattenRoutes([...publicRoutes])
export {
	publicRoutes,
	authProtectedRoutes,
	authProtectedFlattenRoutes,
	publicProtectedFlattenRoutes,
}
