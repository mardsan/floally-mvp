import { ReactNode, Suspense } from 'react'

const loading = () => <div />

interface DefaultLayoutProps {
	children?: ReactNode
}

const DefaultLayout = (props: DefaultLayoutProps) => {
	// get the child view which we would like to render
	const children = props['children'] || null

	return (
		<>
			<Suspense fallback={loading()}>{children}</Suspense>
		</>
	)
}

export default DefaultLayout
