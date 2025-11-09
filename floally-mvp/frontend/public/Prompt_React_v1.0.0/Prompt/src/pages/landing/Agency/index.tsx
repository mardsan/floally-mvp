import { projects } from '../PortFolio/data'
import Blog from './Blog'
import Clients from './Clients'
import Footer from './Footer'
import Hero from './Hero'
import Portfolios from './Portfolios'
import Services from './Services'
import Vacancies from './Vacancies'

// data
import { blogPosts, jobDetails, services } from './data'

const Agency = () => {
	return (
		<>
			<Hero />

			<Services services={services} />

			<Portfolios portfolios={projects} />

			<Clients />

			<Blog blogs={blogPosts} />

			<Vacancies jobDetails={jobDetails} />

			<Footer />
		</>
	)
}

export default Agency
