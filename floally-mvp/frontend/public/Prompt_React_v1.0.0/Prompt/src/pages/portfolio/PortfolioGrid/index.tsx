import { Footer } from '@/components'
import Gallery from './Gallery'
import Hero from './Hero'

//data
import { galleryItems } from './data'

const PortfolioGrid = () => {
	return (
		<>
			<Hero />

			<Gallery galleryItems={galleryItems} />

			<Footer />
		</>
	)
}

export default PortfolioGrid
