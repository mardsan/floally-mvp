import { Footer } from '@/components'
import Blog from './Blog'
import Coins from './Coins'
import Features from './Features'
import Hero from './Hero'
import Integration from './Integration'
import Stats from './Stats'
import { coins, features } from './data'

const Crypto = () => {
	return (
		<>
			<Hero />

			<Coins coins={coins} />

			<Features features={features} />

			<Integration />

			<Stats />

			<Blog />

			<Footer />
		</>
	)
}

export default Crypto
