import { Link } from 'react-router-dom'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

//images
import coWorking1 from '@/assets/images/hero/coworking1.jpg'
import coWorking2 from '@/assets/images/hero/coworking2.jpg'
import coWorking3 from '@/assets/images/hero/coworking3.jpg'

const Hero = () => {
	return (
		<section className="bg-orange-300/10 pt-36 pb-20">
			<div className="container">
				<div className="grid lg:grid-cols-2 grid-cols-1 gap-6 items-center">
					<h1 className="2xl:text-5xl/snug sm:text-4xl/snug text-3xl">
						Explore the best coworking space in the heart of the City
					</h1>
					<p className="2xl:w-2/3 mx-auto text-lg font-medium">
						No more conventional four-walled office. The fully comformtable
						seating solution for you.
					</p>
				</div>
				<div>
					<div className="sm:p-6 p-3 bg-white rounded-xl sm:mx-10 mx-5 translate-y-1/2 relative z-10">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex flex-wrap items-center gap-4">
								<h5 className="text-sm">Search your perfect space</h5>
								<input
									type="text"
									id="fname"
									name="fname"
									placeholder="Enter location"
									className="form-input text-sm font-medium focus:ring-0 focus:border-slate-500 rounded border-slate-400"
								/>
								<Link
									to=""
									className="py-2 px-4 rounded text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500"
								>
									Find Space
								</Link>
							</div>
							<div className="flex items-center gap-1">
								<div className="button-prev swiper-custom-prev cursor-pointer">
									<div className="px-3 py-1 rounded text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500">
										<i className="fa-solid fa-angle-left" />
									</div>
								</div>
								<div className="button-next swiper-custom-next cursor-pointer">
									<div className="px-3 py-1 rounded text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500">
										<i className="fa-solid fa-angle-right" />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div id="swiper_one" className="swiper rounded-xl" data-aos="fade-up">
						<Swiper
							modules={[Autoplay, Navigation]}
							autoplay={{
								delay: 2500,
								disableOnInteraction: false,
							}}
							loop
							navigation={{
								nextEl: '.swiper-custom-next',
								prevEl: '.swiper-custom-prev',
							}}
						>
							<SwiperSlide>
								<img src={coWorking2} className="w-full h-[520px] rounded-xl" />
							</SwiperSlide>
							<SwiperSlide>
								<img src={coWorking3} className="w-full h-[520px] rounded-xl" />
							</SwiperSlide>
							<SwiperSlide>
								<img src={coWorking1} className="w-full h-[520px] rounded-xl" />
							</SwiperSlide>
						</Swiper>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Hero
