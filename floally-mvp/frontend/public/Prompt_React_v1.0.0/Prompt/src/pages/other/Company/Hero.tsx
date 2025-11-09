import { ParallaxBanner, ParallaxProvider } from 'react-scroll-parallax'

//images
import coworking from '@/assets/images/hero/coworking1.jpg'

const Hero = () => {
	return (
		<>
			<section className="pt-36 pb-24 relative">
				<div className="container">
					<div className="text-center">
						<h1 className="text-3xl/tight sm:text-4xl/tight lg:text-5xl/tight font-semibold mb-5">
							We are on a mission to
							<span className="relative z-0 after:bg-primary/30 after:-z-10 after:absolute md:after:h-6 sm:after:h-5 after:h-4 after:w-full after:bottom-0 after:end-0">
								revolutionize
							</span>{' '}
							the web
						</h1>
						<p className="sm:text-lg text-gray-500">
							We are a full-stack web development studio, run by people who are
							very passionate about making the web more beautiful
						</p>
					</div>
				</div>
			</section>
			<section>
				<span className="flex justify-center items-center relative z-20 translate-y-1/2">
					<div className="bg-primary text-white rounded-md text-sm font-semibold flex-none shadow shadow-primary/20 cursor-pointer hover:shadow-lg hover:shadow-primary/30 focus:shadow-none focus:outline focus:outline-primary/30 uppercase px-16 py-3">
						Let's Have Talk
					</div>
				</span>

				<ParallaxProvider>
					<ParallaxBanner
						layers={[
							{
								image: coworking,
								speed: -55,
								style: { backgroundSize: 'contain' },
							},
						]}
						className="flex items-center md:py-80 py-44 jarallax"
					/>
				</ParallaxProvider>
			</section>
		</>
	)
}

export default Hero
