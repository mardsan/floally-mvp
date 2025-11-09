import { Footer } from '@/components'
import About from './About'
import Client from './Client'
import Counter from './Counter'
import Feature from './Feature'
import Hero from './Hero'
import Team from './Team'

//data
import { teamMembers } from './data'

const Company = () => {
	return (
		<div className="text-gray-700">
			<Hero />

			<About />

			<Feature />

			<Counter />

			<Team teamMembers={teamMembers} />

			<Client />

			<Footer />
		</div>
	)
}

export default Company
