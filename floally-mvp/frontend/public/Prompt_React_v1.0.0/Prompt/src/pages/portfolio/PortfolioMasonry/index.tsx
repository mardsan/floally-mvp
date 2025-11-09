import { Footer } from '@/components'
import Gallery from './Gallery'
import Hero from './Hero'
import { galleryItems } from './data'

const PortfolioMasonry = () => {
	return (
		<>
			<div>
				<Hero />

				<Gallery galleryItems={galleryItems} />

				<Footer />
			</div>
		</>
	)
}

export default PortfolioMasonry
