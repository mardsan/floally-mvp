import { Footer2 } from '@/components'
import ClientsReview from './ClientsReview'
import Features from './Features'
import Hero from './Hero'
import Integrations from './Integrations'
import Pricing from './Pricing'
import { integrations, planFeatures } from './data'

const Startup = () => {
	return (
		<div className="text-gray-700">
			<Hero />

			<ClientsReview />

			<Features />

			<Integrations integrations={integrations} />

			<Pricing planFeatures={planFeatures} />

			<Footer2 socialIcon />
		</div>
	)
}

export default Startup
