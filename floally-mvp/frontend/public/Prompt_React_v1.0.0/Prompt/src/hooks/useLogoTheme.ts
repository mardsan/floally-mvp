import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function useLogoTheme() {
	const [isDark, setIsDark] = useState(false)

	const location = useLocation()

	useEffect(() => {
		const paths: string[] = ['/pages/blogs/list']
		if (!paths.includes(location.pathname)) setIsDark(true)
	}, [location.pathname])

	return { isDark }
}
