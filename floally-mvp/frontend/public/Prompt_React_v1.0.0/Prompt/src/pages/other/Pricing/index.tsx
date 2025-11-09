import Benefits from './Benefits'
import Hero from './Hero'
import PricingPlans from './PricingPlans'
import { benefits } from './data'
import FAQs from './FAQs'
import CTA from './CTA'
import { Footer } from '@/components'

const Pricing = () => {
	return (
		<>
			<div>
				<Hero />

				<PricingPlans />

				<Benefits benefits={benefits} />

				<FAQs />

				<CTA />

				<Footer />
			</div>
		</>
	)
}

export default Pricing
