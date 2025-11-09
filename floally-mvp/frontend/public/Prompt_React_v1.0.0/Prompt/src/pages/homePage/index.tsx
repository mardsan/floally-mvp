import AccountPages from './AccountPages'
import CTA from './CTA'
import Demos from './Demos'
import Features from './Features'
import Hero from './Hero'
import InnerPages from './InnerPages'

//data
import { accountPages, features, landings, secondaryPages } from './data'

const Home = () => {
	return (
		<>
			<Hero />
			{/* demos */}
			<Demos landings={landings} />

			<InnerPages innerPages={secondaryPages} />

			<AccountPages accountPages={accountPages} />

			<Features features={features} />

			<CTA />
		</>
	)
}

export default Home
