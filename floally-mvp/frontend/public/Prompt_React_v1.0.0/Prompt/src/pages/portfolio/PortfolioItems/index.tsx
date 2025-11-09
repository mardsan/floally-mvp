import { Footer } from '@/components'
import Content from './Content'
import Hero from './Hero'
import Navigation from './Navigation'
import Testimonial from './Testimonial'

//data
import { workImages } from './data'

const PortfolioItems = () => {
	return (
		<>
			<Hero />

			<Content workImages={workImages} />

			<Testimonial />

			<Navigation />

			<Footer />
		</>
	)
}

export default PortfolioItems
