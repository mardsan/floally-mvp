import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

const container = document.getElementById('root')
if (container) {
	const root = createRoot(container)
	root.render(
		// <React.StrictMode>
		<BrowserRouter basename={""}>
			<App />
		</BrowserRouter>
	)
}
