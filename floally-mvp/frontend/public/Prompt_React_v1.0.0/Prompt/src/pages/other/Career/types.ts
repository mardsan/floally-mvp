import { ReactNode } from 'react'

export type Benefit = {
	icon: ReactNode
	title: string
	description: string
}

export type ImageType = {
	src: string
	caption: string
}

export type GalleryItem = {
	id?: number
	image: ImageType
}

export type Vacancy = {
	category: string
	jobs: {
		designation: string
		type: string
	}[]
}
