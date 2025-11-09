import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'

const ThemeContext = createContext<any>({})

export const ThemeSettings = {
	topbar: {
		theme: { light: 'light', dark: 'dark' },
		logo: { hidden: 'fullscreen', show: '' },
	},

}

export function useThemeContext() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useThemeContext must be used within an ThemeProvider')
	}
	return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState({

		topbar: {
			theme: ThemeSettings.topbar.theme.light,
			logo: ThemeSettings.topbar.logo.show,
		},
	})

	const updateSettings = useCallback(
		(newSettings: any) => {
			setSettings((prev) => ({ ...(prev ?? {}), ...(newSettings ?? {}) }))
		},
		[setSettings]
	)


	const updateTopbar = useCallback(
		(newTopbar: any) => {
			setSettings((prev) => ({
				...(prev ?? {}),
				topbar: { ...(prev ?? {}).topbar, ...(newTopbar ?? {}) },
			}))
		},
		[setSettings]
	)


	return (
		<ThemeContext.Provider
			value={{
				settings,
				updateSettings,
				updateTopbar,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
