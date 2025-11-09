export type Integration = {
	appLogo: string
	app: string
	description: string
}

type Availability = {
	available: boolean
	addon?: boolean
}

export type PlanFeature = {
	name: string
	starter: Availability
	professional: Availability
	enterprise: Availability
}
