import { ReactNode, Suspense, lazy } from 'react'

const Navbar = lazy(() => import('./Navbar'))
const ScrollToTop = lazy(() => import('@/components/ScrollToTop'))

interface HorizontaLayoutProps {
	children?: ReactNode
}

const HorizontalLayout = ({ children }: HorizontaLayoutProps) => {
	return (
		<>
			<Suspense fallback={<div />}>
				<Navbar />
			</Suspense>

			<Suspense fallback={<div />}>{children}</Suspense>

			<Suspense fallback={<div />}>
				<ScrollToTop />
			</Suspense>
		</>
	)
}

export default HorizontalLayout
