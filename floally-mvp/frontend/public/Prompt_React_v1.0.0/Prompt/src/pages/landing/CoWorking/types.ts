import { ReactNode } from 'react'

export type Feature = {
	icon: ReactNode
	title: string
	description: string
}

export type SpaceOption = {
	image: string
	title: string
	description: string
	space: {
		icon: ReactNode
		value: string
	}
}

export type Testimonial = {
	statement: string
	customer: {
		avatar: string
		name: string
		designation: string
	}
	logo: string
}
