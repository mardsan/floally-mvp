import { Footer } from '@/components'
import Benefits from './Benefits'
import CTA from './CTA'
import Culture from './Culture'
import Hero from './Hero'
import Vacancies from './Vacancies'

//data
import { benefits, vacancies } from './data'

const career = () => {
	return (
		<>
			<div className="text-gray-800">
				<Hero />

				<Benefits benefits={benefits} />

				<Culture />

				<Vacancies vacancies={vacancies} />

				<CTA />

				<Footer />
			</div>
		</>
	)
}

export default career
