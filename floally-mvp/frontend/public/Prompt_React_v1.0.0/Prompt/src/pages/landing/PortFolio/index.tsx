import CTA from './CTA'
import Footer from './Footer'
import Hero from './Hero'
import Projects from './Projects'
import Services from './Services'
import Testimonials from './Testimonials'
import { projects, services, testimonials } from './data'

const PortFolio = () => {
	return (
		<>
			<Hero />

			<Services services={services} />

			<Projects projects={projects} />

			<Testimonials testimonials={testimonials} />

			<CTA />

			<Footer />
		</>
	)
}

export default PortFolio
