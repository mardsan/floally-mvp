import { Testimonial } from './types'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

//images
import whiteWave from '@/assets/images/shapes/white-wave.svg'

type TestimonialProps = {
	testimonials: Testimonial[]
}

const Testimonials = ({ testimonials }: TestimonialProps) => {
	return (
		<section
			className="py-20 relative overflow-x-hidden bg-gradient-to-b from-red-500/5 to-amber-500/5"
			data-aos="fade-up"
			data-aos-duration={600}
		>
			<div className="absolute top-0 inset-x-0 hidden sm:block">
				<img src={whiteWave} alt="svg" className="w-full -scale-x-100" />
			</div>
			<div className="container relative">
				<div className="relative z-20">
					<div className="flex items-center justify-between pb-14">
						<div>
							<h2 className="md:text-3xl text-xl font-semibold my-5">
								Kind words from excellent clients
							</h2>
						</div>
						<div className="flex items-center gap-5">
							<div className="button-prev swiper-custom-prev cursor-pointer">
								<i className="fa-solid fa-arrow-left" />
							</div>
							<div className="button-next swiper-custom-next cursor-pointer">
								{' '}
								<i className="fa-solid fa-arrow-right" />
							</div>
						</div>
					</div>
					<div className="relative">
						<div className="hidden sm:block">
							<div className="before:w-24 before:h-24 before:absolute before:-top-10 before:-end-10 before:bg-[url('@/assets/images/pattern/dot3.svg')]" />
							<div className="after:w-24 after:h-24 after:absolute after:-bottom-10 after:-start-10 after:bg-[url('@/assets/images/pattern/dot3.svg')]" />
						</div>
						<div id="swiper_two" className="swiper">
							<Swiper
								modules={[Autoplay, Navigation]}
								autoplay={{
									delay: 2500,
									disableOnInteraction: false,
								}}
								slidesPerView={2}
								spaceBetween={30}
								loop
								navigation={{
									nextEl: '.swiper-custom-next',
									prevEl: '.swiper-custom-prev',
								}}
							>
								{(testimonials || []).map((testimonial, idx) => {
									return (
										<SwiperSlide key={idx}>
											<div className="p-12 bg-white border">
												<p className="text-slate-800">
													{testimonial.description}
												</p>
												<div className="flex items-center justify-between mt-5">
													<div className="flex items-center gap-3">
														<div>
															<img
																src={testimonial.image}
																className="w-10 rounded-full"
															/>
														</div>
														<div>
															<h6>{testimonial.name}</h6>
															<p className="text-sm text-slate-500">
																{testimonial.position}
															</p>
														</div>
													</div>
													<div>
														<img src={testimonial.brand} className="w-24" />
													</div>
												</div>
											</div>
										</SwiperSlide>
									)
								})}
							</Swiper>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Testimonials
