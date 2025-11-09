import {
	FAQs,
	Features,
	Footer,
	PricingCards,
	Clients,
	FeedBack,
} from '@/components'
import Hero from './Hero'

//image
import whiteWave from '@/assets/images/shapes/white-wave.svg'

const SassModern = () => {
	return (
		<div className="text-gray-800">
			<Hero />
			<Features />
			<Clients />
			<FeedBack />

			<section className="bg-gradient-to-r from-gray-100/70 to-gray-100 relative py-16 sm:py-24">
				<div className="absolute top-0 inset-x-0 hidden sm:block">
					<img src={whiteWave} alt="svg" className="w-full -scale-x-100" />
				</div>
				<div className="py-5">
					<PricingCards />
				</div>
				<div className="absolute bottom-0 inset-x-0 hidden sm:block">
					<img
						src={whiteWave}
						alt="svg"
						className="w-full scale-x-100 -scale-y-100"
					/>
				</div>
			</section>

			<FAQs />
			<Footer />
		</div>
	)
}

export default SassModern
