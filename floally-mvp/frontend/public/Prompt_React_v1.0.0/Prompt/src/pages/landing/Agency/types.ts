import { ReactNode } from 'react'

export type Service = {
	icon: ReactNode
	variant: string
	title: string
	description: string
}

export type BlogPost = {
	heading: string
	img: string
	time: string
	title: string
	description: string
}

export type JobDetail = {
	designation: string
	location: string
	jobType: string
}
