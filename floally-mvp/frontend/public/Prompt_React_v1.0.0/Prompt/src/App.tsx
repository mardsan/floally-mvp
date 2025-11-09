import { useEffect } from 'react'
import AllRoutes from './routes/Routes'
import { ThemeProvider } from './context'
import Aos from 'aos'

// styles
import 'swiper/css'
import './index.scss'

function App() {
	useEffect(() => {
		Aos.init()
	}, [])

	return (
		<>
			<ThemeProvider>
				<AllRoutes />
			</ThemeProvider>
		</>
	)
}

export default App
