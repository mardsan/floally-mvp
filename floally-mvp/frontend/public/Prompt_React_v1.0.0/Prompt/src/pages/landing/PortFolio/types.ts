import { ReactNode } from 'react'

export type Service = {
	icon: ReactNode
	title: string
	description: string
}

export type Project = {
	title: string
	description: string
	image: string
}

export type Testimonial = {
	name: string
	position: string
	description: string
	image: string
	brand: string
}
