import About from './About'
import Features from './Features'
import Hero from './Hero'
import SpaceOptions from './SpaceOptions'
import Testimonials from './Testimonials'
import Footer from './Footer'

//data
import { features, spaceOptions, testimonials } from './data'

const CoWorking = () => {
	return (
		<>
			<Hero />

			<About />

			<Features features={features} />

			<SpaceOptions spaceOptions={spaceOptions} />

			<Testimonials testimonials={testimonials} />

			<Footer />
		</>
	)
}

export default CoWorking
