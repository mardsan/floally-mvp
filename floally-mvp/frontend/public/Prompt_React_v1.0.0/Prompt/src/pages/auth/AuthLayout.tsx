import { ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'

//images
import logoDark from '@/assets/images/logo-dark.png'
import sass1 from '@/assets/images/hero/saas1.jpg'
import sass2 from '@/assets/images/hero/saas2.jpg'
import sass3 from '@/assets/images/hero/saas3.jpg'

// styles
import 'swiper/css'
import 'swiper/css/pagination'

interface AccountLayoutProps {
	authTitle?: string
	helpText?: string
	bottomLinks?: ReactNode
	isCombineForm?: boolean
	children?: ReactNode
	hasForm?: boolean
}
const AuthLayout = ({
	authTitle,
	helpText,
	bottomLinks,
	children,
}: AccountLayoutProps) => {
	useEffect(() => {
		if (document.body) {
			document.body.classList.add('bg-slate-100', 'tracking-wide')
		}

		return () => {
			if (document.body) {
				document.body.classList.remove('bg-slate-100', 'tracking-wide')
			}
		}
	}, [])
	return (
		<>
			<div className="min-h-screen flex items-center justify-center">
				<div className="container">
					<div>
						<div className="bg-white shadow rounded mb-6">
							<div className="grid md:grid-cols-12">
								<div className="bg-white shadow-md p-12 rounded-s xl:col-span-5 md:col-span-6">
									<div className="mb-12">
										<Link to="/">
											<img src={logoDark} alt="logo-img" className="h-8" />
										</Link>
									</div>
									<h6 className="text-base/[1.6] font-semibold text-gray-600 mb-0 mt-4">
										{authTitle}
									</h6>
									<p className="text-gray-500 text-sm/[1.6] mt-1 mb-6">
										{helpText}
									</p>
									{children}
									<div className="py-4 text-center">
										<span className="fs-13 fw-bold">OR</span>
									</div>
									<div className="w-full">
										<a
											href=""
											className="block border text-gray-500 font-medium leading-6 text-center align-middle select-none py-2 px-4 text-sm rounded-md transition-all hover:shadow-md"
										>
											<span className="flex items-center justify-center">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width={24}
													height={24}
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													strokeLinecap="round"
													strokeLinejoin="round"
													className="feather feather-github icon icon-xs me-2"
												>
													<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
												</svg>
												Github
											</span>
										</a>
									</div>
								</div>
								<div className="hidden md:block xl:col-span-7 md:col-span-6">
									<div className="max-w-[80%] mx-auto">
										<div className="my-12 py-12">
											<div className="flex items-center justify-center h-full">
												<Swiper
													modules={[Autoplay, Pagination]}
													pagination={{
														clickable: true,
													}}
													autoplay={{
														delay: 2500,
														disableOnInteraction: false,
													}}
													loop
												>
													<SwiperSlide>
														<div className="swiper-slide-content">
															<div className="text-center w-3/5 mx-auto">
																<img src={sass1} className="w-full" />
															</div>
															<div className="text-center my-6 pb-12">
																<h5 className="font-medium text-base/[1.6] text-gray-600 my-2.5">
																	Manage your saas business with ease
																</h5>
																<p className="text-sm/[1.6] text-gray-500 mb-4">
																	Make your saas application stand out with
																	high-quality landing page designed and
																	developed by professional.
																</p>
															</div>
														</div>
													</SwiperSlide>
													<SwiperSlide>
														<div className="swiper-slide-content">
															<div className="text-center w-3/5 mx-auto">
																<img src={sass2} className="w-full" />
															</div>
															<div className="text-center my-6 pb-12">
																<h5 className="font-medium text-base/[1.6] text-gray-600 my-2.5">
																	The best way to showcase your mobile app
																</h5>
																<p className="text-sm/[1.6] text-gray-500">
																	Sed ut perspiciatis unde omnis iste natus
																	error sit voluptatem accusantium.
																</p>
															</div>
														</div>
													</SwiperSlide>
													<SwiperSlide>
														<div className="swiper-slide-content">
															<div className="text-center w-3/5 mx-auto">
																<img src={sass3} className="w-full" />
															</div>
															<div className="text-center my-6 pb-12">
																<h5 className="font-medium text-base/[1.6] text-gray-600 my-2.5">
																	Smart Solution that convert Lead to Customer
																</h5>
																<p className="text-sm/[1.6] text-gray-500">
																	Sed ut perspiciatis unde omnis iste natus
																	error sit voluptatem accusantium.
																</p>
															</div>
														</div>
													</SwiperSlide>
													<div className="swiper-pagination !bottom-0" />
												</Swiper>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						{bottomLinks}
					</div>
				</div>
			</div>
		</>
	)
}

export default AuthLayout
