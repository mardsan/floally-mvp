// swiper
import { Navigation, Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// types
import { Testimonial } from './types'

type TestimonialsProps = {
	testimonials: Testimonial[]
}

const SwiperSlider = ({ testimonials }: TestimonialsProps) => {
	return (
		<Swiper
			modules={[Pagination, Autoplay, Navigation]}
			loop
			spaceBetween={30}
			autoplay={{ delay: 2500 }}
			breakpoints={{
				'576': { slidesPerView: 1 },
				'768': { slidesPerView: 2 },
			}}
			roundLengths
			navigation={{
				nextEl: '.swiper-custom-next',
				prevEl: '.swiper-custom-prev',
			}}
		>
			{(testimonials || []).map((testimonial, idx) => {
				return (
					<SwiperSlide key={idx}>
						<div className="md:p-12 p-6 border rounded">
							<h5 className="font-light">{testimonial.statement}</h5>
							<div className="flex items-center justify-between mt-5">
								<div className="flex items-center gap-3">
									<div>
										<img
											src={testimonial.customer.avatar}
											className="w-10 rounded-full"
										/>
									</div>
									<div>
										<h6 className="text-sm">{testimonial.customer.name}</h6>
										<p className="text-sm text-slate-500">
											{testimonial.customer.designation}
										</p>
									</div>
								</div>
								<div>
									<img src={testimonial.logo} className="w-24" />
								</div>
							</div>
						</div>
					</SwiperSlide>
				)
			})}
		</Swiper>
	)
}
const Testimonials = ({ testimonials }: TestimonialsProps) => {
	return (
		<section className="py-20" data-aos="fade-up">
			<div className="container">
				<div className="relative z-20">
					<div className="flex items-center justify-between pb-14">
						<div>
							<h2 className="md:text-3xl text-xl my-5">
								See what our members are saying
							</h2>
						</div>
						<div className="flex items-center gap-5">
							<div className="button-prev swiper-custom-prev cursor-pointer">
								<i className="fa-solid fa-arrow-left text-primary" />
							</div>
							<div className="button-next swiper-custom-next cursor-pointer">
								<i className="fa-solid fa-arrow-right text-primary" />
							</div>
						</div>
					</div>
					<div>
						<div id="swiper_two" className="swiper">
							<SwiperSlider testimonials={testimonials} />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Testimonials
