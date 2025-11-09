import { useState } from 'react'
import { FUCollapse } from '@/components'
import { Link } from 'react-router-dom'

//images
import sass1 from '@/assets//images/hero/saas1.jpg'
import sass2 from '@/assets//images/hero/saas2.jpg'

const Features = () => {
	const [accordion, setAccordion] = useState<number | null>(0)

	const handleAccordion = (index: number) => () => {
		if (index === accordion) setAccordion(null)
		else setAccordion(index)
	}

	return (
		<>
			<section className="overflow-hidden">
				<div className="xl:py-24 py-16">
					<div className="container">
						<div className="text-center">
							<span className="text-sm font-medium py-1 px-3 rounded-full text-primary bg-primary/10">
								Features
							</span>
							<h1 className="text-3xl/tight font-medium mt-3 mb-4">
								Better Management. Better Performance
							</h1>
							<p className="text-gray-500">
								Start working with <span className="text-primary">Prompt</span>{' '}
								to manage your workforce better
							</p>
						</div>

						<div className="xl:pt-16 xl:pb-28 py-16">
							<div className="grid lg:grid-cols-2 grid-cols-1 gap-6 items-center">
								<div className="relative">
									<div className="hidden sm:block">
										<div className="after:w-20 after:h-20 after:absolute after:-top-8 after:-start-8 2xl:after:end-0 after:bg-[url('@/assets/images/pattern/dot5.svg')]"></div>
										<div className="before:w-20 before:h-20 before:absolute before:-bottom-8 before:-end-8 before:bg-[url('@/assets/images/pattern/dot2.svg')]"></div>
									</div>
									<img
										src={sass1}
										alt="saas1"
										data-aos="fade-right"
										data-aos-duration="400"
									/>
								</div>

								<div className="lg:ms-24">
									<div
										data-fc-type="accordion"
										data-aos="fade-up"
										data-aos-duration="500"
									>
										<FUCollapse
											open={accordion == 0}
											toggleCollapse={handleAccordion(0)}
										>
											<FUCollapse.Toggle
												className="pt-2 inline-flex items-center gap-x-4 w-full font-medium text-left text-gray-800 transition-all hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
												data-fc-type="collapse"
											>
												<div className="bg-blue-500/10 rounded-lg flex items-center justify-center h-12 w-12">
													<svg
														className="h-6 w-6 text-blue-500"
														viewBox="0 0 24 24"
														version="1.1"
														xmlns="http://www.w3.org/2000/svg"
														xmlnsXlink="http://www.w3.org/1999/xlink"
													>
														{' '}
														<g
															stroke="none"
															strokeWidth="1"
															fill="none"
															fillRule="evenodd"
														>
															{' '}
															<polygon
																id="Shape"
																points="0 0 24 0 24 24 0 24"
															></polygon>{' '}
															<path
																d="M18,14 C16.3431458,14 15,12.6568542 15,11 C15,9.34314575 16.3431458,8 18,8 C19.6568542,8 21,9.34314575 21,11 C21,12.6568542 19.6568542,14 18,14 Z M9,11 C6.790861,11 5,9.209139 5,7 C5,4.790861 6.790861,3 9,3 C11.209139,3 13,4.790861 13,7 C13,9.209139 11.209139,11 9,11 Z"
																id="Combined-Shape"
																fill="currentColor"
																opacity="0.3"
															></path>{' '}
															<path
																d="M17.6011961,15.0006174 C21.0077043,15.0378534 23.7891749,16.7601418 23.9984937,20.4 C24.0069246,20.5466056 23.9984937,21 23.4559499,21 L19.6,21 C19.6,18.7490654 18.8562935,16.6718327 17.6011961,15.0006174 Z M0.00065168429,20.1992055 C0.388258525,15.4265159 4.26191235,13 8.98334134,13 C13.7712164,13 17.7048837,15.2931929 17.9979143,20.2 C18.0095879,20.3954741 17.9979143,21 17.2466999,21 C13.541124,21 8.03472472,21 0.727502227,21 C0.476712155,21 -0.0204617505,20.45918 0.00065168429,20.1992055 Z"
																id="Combined-Shape"
																fill="currentColor"
															></path>{' '}
														</g>{' '}
													</svg>{' '}
												</div>
												<h1 className="font-medium mb-4 mt-2">
													Improve Employee Experience
												</h1>
											</FUCollapse.Toggle>
											<FUCollapse.Menu className="w-full overflow-hidden duration-300 ps-16">
												<p className="text-gray-700 dark:text-gray-300">
													Before we dive into why companies must invest in
													employee experience (EX), it’s important to understand
													what this concept entails.
												</p>
												<div className="mt-7 flex items-center">
													<Link to="" className="text-primary">
														Learn more{' '}
														<i className="fa-solid fa-arrow-right ms-2"></i>
													</Link>
												</div>
											</FUCollapse.Menu>
										</FUCollapse>

										<div className="border-b my-6"></div>

										<FUCollapse
											open={accordion == 1}
											toggleCollapse={handleAccordion(1)}
										>
											<FUCollapse.Toggle
												className="pt-2 inline-flex items-center gap-x-4 w-full font-medium text-left text-gray-800 transition hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
												data-fc-type="collapse"
											>
												<div className="bg-green-500/10 rounded-lg flex items-center justify-center h-12 w-12">
													<svg
														className="h-6 w-6 text-green-500"
														viewBox="0 0 24 24"
														version="1.1"
														xmlns="http://www.w3.org/2000/svg"
														xmlnsXlink="http://www.w3.org/1999/xlink"
													>
														{' '}
														<g
															stroke="none"
															strokeWidth="1"
															fill="none"
															fillRule="evenodd"
														>
															{' '}
															<polygon
																id="Shape"
																points="0 0 24 0 24 24 0 24"
															></polygon>{' '}
															<path
																d="M18,8 L16,8 C15.4477153,8 15,7.55228475 15,7 C15,6.44771525 15.4477153,6 16,6 L18,6 L18,4 C18,3.44771525 18.4477153,3 19,3 C19.5522847,3 20,3.44771525 20,4 L20,6 L22,6 C22.5522847,6 23,6.44771525 23,7 C23,7.55228475 22.5522847,8 22,8 L20,8 L20,10 C20,10.5522847 19.5522847,11 19,11 C18.4477153,11 18,10.5522847 18,10 L18,8 Z M9,11 C6.790861,11 5,9.209139 5,7 C5,4.790861 6.790861,3 9,3 C11.209139,3 13,4.790861 13,7 C13,9.209139 11.209139,11 9,11 Z"
																id="Combined-Shape"
																fill="currentColor"
																opacity="0.3"
															></path>{' '}
															<path
																d="M0.00065168429,20.1992055 C0.388258525,15.4265159 4.26191235,13 8.98334134,13 C13.7712164,13 17.7048837,15.2931929 17.9979143,20.2 C18.0095879,20.3954741 17.9979143,21 17.2466999,21 C13.541124,21 8.03472472,21 0.727502227,21 C0.476712155,21 -0.0204617505,20.45918 0.00065168429,20.1992055 Z"
																id="Mask-Copy"
																fill="currentColor"
															></path>{' '}
														</g>{' '}
													</svg>{' '}
												</div>
												<h1 className="font-medium mb-4 mt-2">
													Hiring & Onboarding
												</h1>
											</FUCollapse.Toggle>
											<FUCollapse.Menu className="w-full overflow-hidden duration-300 ps-16">
												<p className="text-gray-700 dark:text-gray-300">
													Post your job, interview candidates and make offers,
													all on Prompt. Start hiring today.
												</p>
												<div className="mt-7 flex items-center">
													<Link to="" className="text-primary">
														Learn more{' '}
														<i className="fa-solid fa-arrow-right ms-2"></i>
													</Link>
												</div>
											</FUCollapse.Menu>
										</FUCollapse>

										<div className="border-b my-6"></div>

										<FUCollapse
											open={accordion == 2}
											toggleCollapse={handleAccordion(2)}
										>
											<FUCollapse.Toggle
												className="pt-2 inline-flex items-center gap-x-4 w-full font-medium text-left text-gray-800 transition hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
												data-fc-type="collapse"
											>
												<div className="bg-orange-500/10 rounded-lg flex items-center justify-center h-12 w-12">
													<svg
														className="h-6 w-6 text-orange-500"
														viewBox="0 0 24 24"
														version="1.1"
														xmlns="http://www.w3.org/2000/svg"
														xmlnsXlink="http://www.w3.org/1999/xlink"
													>
														{' '}
														<g
															stroke="none"
															strokeWidth="1"
															fill="none"
															fillRule="evenodd"
														>
															{' '}
															<rect
																id="bound"
																x="0"
																y="0"
																width="24"
																height="24"
															></rect>{' '}
															<rect
																id="Rectangle-62-Copy"
																fill="currentColor"
																opacity="0.3"
																x="7"
																y="4"
																width="3"
																height="13"
																rx="1.5"
															></rect>{' '}
															<rect
																id="Rectangle-62-Copy-2"
																fill="currentColor"
																opacity="0.3"
																x="12"
																y="9"
																width="3"
																height="8"
																rx="1.5"
															></rect>{' '}
															<path
																d="M5,19 L20,19 C20.5522847,19 21,19.4477153 21,20 C21,20.5522847 20.5522847,21 20,21 L4,21 C3.44771525,21 3,20.5522847 3,20 L3,4 C3,3.44771525 3.44771525,3 4,3 C4.55228475,3 5,3.44771525 5,4 L5,19 Z"
																id="Path-95"
																fill="currentColor"
															></path>{' '}
															<rect
																id="Rectangle-62-Copy-4"
																fill="currentColor"
																opacity="0.3"
																x="17"
																y="11"
																width="3"
																height="6"
																rx="1.5"
															></rect>{' '}
														</g>{' '}
													</svg>{' '}
												</div>
												<h1 className="font-medium mb-4 mt-2">
													People Data & Analytics
												</h1>
											</FUCollapse.Toggle>
											<FUCollapse.Menu className="w-full overflow-hidden duration-300 ps-16">
												<p className="text-gray-700 dark:text-gray-300">
													Finding committed employees is one of public and
													private organizations’ top priorities.
												</p>
												<div className="mt-7 flex items-center">
													<Link to="" className="text-primary">
														Learn more{' '}
														<i className="fa-solid fa-arrow-right ms-2"></i>
													</Link>
												</div>
											</FUCollapse.Menu>
										</FUCollapse>
									</div>
								</div>
							</div>
						</div>

						<div>
							<div className="grid lg:grid-cols-2 grid-cols-1n gap-6 items-center">
								<div
									className="order-2 lg:order-1 2xl:w-9/12"
									data-aos="fade-up"
									data-aos-duration="500"
								>
									<div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg">
										<svg
											className="h-7 w-7 text-primary"
											viewBox="0 0 24 24"
											version="1.1"
											xmlns="http://www.w3.org/2000/svg"
											xmlnsXlink="http://www.w3.org/1999/xlink"
										>
											{' '}
											<g
												stroke="none"
												strokeWidth="1"
												fill="none"
												fillRule="evenodd"
											>
												{' '}
												<rect
													id="bound"
													x="0"
													y="0"
													width="24"
													height="24"
												></rect>{' '}
												<path
													d="M10.8226874,8.36941377 L12.7324324,9.82298668 C13.4112512,8.93113547 14.4592942,8.4 15.6,8.4 C17.5882251,8.4 19.2,10.0117749 19.2,12 C19.2,13.9882251 17.5882251,15.6 15.6,15.6 C14.5814697,15.6 13.6363389,15.1780547 12.9574041,14.4447676 L11.1963369,16.075302 C12.2923051,17.2590082 13.8596186,18 15.6,18 C18.9137085,18 21.6,15.3137085 21.6,12 C21.6,8.6862915 18.9137085,6 15.6,6 C13.6507856,6 11.9186648,6.9294879 10.8226874,8.36941377 Z"
													id="Combined-Shape"
													fill="currentColor"
													opacity="0.3"
												></path>{' '}
												<path
													d="M8.4,18 C5.0862915,18 2.4,15.3137085 2.4,12 C2.4,8.6862915 5.0862915,6 8.4,6 C11.7137085,6 14.4,8.6862915 14.4,12 C14.4,15.3137085 11.7137085,18 8.4,18 Z"
													id="Oval-14-Copy"
													fill="currentColor"
												></path>{' '}
											</g>{' '}
										</svg>{' '}
									</div>

									<h1 className="text-3xl/tight font-medium mt-6 mb-4">
										Smart Payroll. Paying your people couldn't be easier
									</h1>
									<p className="text-gray-500">
										You can modify your pages with drag-dropping , can import
										demos with just ” One Click” and can modify theme setting
										easy-to-use options panel.
									</p>
									<div className="flex items-center mt-12">
										<Link to="" className="text-primary">
											Learn more{' '}
											<i className="fa-solid fa-arrow-right ms-2"></i>{' '}
										</Link>
									</div>
								</div>

								<div className="relative order-1 lg:order-2">
									<div className="hidden sm:block">
										<div className="after:w-20 after:h-20 after:absolute after:-top-8 after:-end-8 2xl:after:-end-8 after:bg-[url('@/assets/images/pattern/dot2.svg')]"></div>
										<div className="before:w-20 before:h-20 before:absolute before:-bottom-8 before:-start-8 before:bg-[url('@/assets/images/pattern/dot5.svg')]"></div>
									</div>

									<img
										src={sass2}
										alt="saas2"
										data-aos="fade-left"
										data-aos-duration="400"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="xl:py-24 py-16">
					<div className="container" data-aos="fade-up" data-aos-duration="600">
						<div className="text-center">
							<h1 className="text-2xl font-medium">
								Any many more powerful features
							</h1>
						</div>

						<div className="py-16">
							<div className="grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5">
								<div className="order-1">
									<div className="flex flex-col gap-5">
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Hire and Retain Top Talent
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Team Management
										</p>
									</div>
								</div>

								<div className="order-3 xl:order-2">
									<div className="flex flex-col gap-5">
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Stay Compliant
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Improve Productivity
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Improve Experience
										</p>
									</div>
								</div>

								<div className="order-4 xl:order-3">
									<div className="flex flex-col gap-5">
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Self-service Time Tracking
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Performance Management
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Expert HR
										</p>
									</div>
								</div>

								<div className="order-2 xl:order-4">
									<div className="flex flex-col gap-5">
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											New Hire Checklist
										</p>
										<p className="flex items-center gap-3">
											{' '}
											<i className="fa-solid fa-check text-green-500 text-xl"></i>{' '}
											Tax Calculator
										</p>
									</div>
								</div>
							</div>
						</div>

						<button className="flex items-center justify-center mx-auto">
							<Link
								to=""
								className="bg-primary text-white rounded-lg text-sm font-semibold flex-none hover:shadow-lg  hover:shadow-primary/30 focus:shadow-none focus:outline focus:outline-primary/40 px-6 py-3"
							>
								Sign Up Now <i className="fa-solid fa-arrow-right ms-2"></i>{' '}
							</Link>
						</button>
					</div>
				</div>
			</section>
		</>
	)
}

export default Features
