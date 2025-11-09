import { ReactNode } from 'react'

export type Coin = {
	icon: string
	name: string
	variant: string
	size?: string
	isSolid?: boolean
}

export type Feature = {
	icon: ReactNode
	title: string
	description: string
}
