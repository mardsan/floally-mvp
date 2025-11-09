import Tippy from '@tippyjs/react'

//images
import blogImg1 from '@/assets/images/blog/blog-1.png'
import blogImg2 from '@/assets/images/blog/blog-2.png'

//style
import 'tippy.js/dist/tippy.css'

const Navigation = () => {
	return (
		<section className="py-14">
			<div className="container">
				<div className="grid md:grid-cols-3 grid-cols-1 gap-5 items-center py-7 border-y">
					<div>
						<div>
							<div className="flex items-center justify-start">
								<Tippy
									className="!bg-transparent"
									arrow={false}
									content={
										<div
											className="bg-white shadow-lg rounded-md transition-all z-50 p-4 w-72"
											role="tooltip"
										>
											<div className="flex items-center gap-5">
												<img src={blogImg1} className="w-16 rounded" />
												<div>
													<h6 className="text-sm text-gray-500">
														Introducing new blazzing fast user interface
													</h6>
													<p className="text-sm text-gray-500">
														by Emily Blunt
													</p>
												</div>
											</div>
											<div
												className="bg-white w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]"
												data-fc-arrow
											/>
										</div>
									}
								>
									<button
										className="border border-gray-300 rounded-md text-sm tracking-wider transition-all duration-300 hover:shadow-lg py-2 px-5"
										data-fc-placement="top"
										data-fc-type="tooltip"
									>
										<i className="fa-solid fa-arrow-left me-2" /> Awesome Saas
										App
									</button>
								</Tippy>
							</div>
						</div>
					</div>
					<div className="flex md:justify-center">
						<a
							href="#"
							className="border border-gray-300 rounded-md text-sm tracking-wider transition-all duration-300 hover:shadow-lg py-2 px-5"
						>
							View All
						</a>
					</div>
					<div>
						<div className="flex items-center md:justify-end justify-start">
							<Tippy
								className="!bg-transparent"
								arrow={false}
								content={
									<div
										className="bg-white shadow-lg rounded-md transition-all z-50 p-4 w-72"
										role="tooltip"
									>
										<div className="flex items-center gap-5">
											<img src={blogImg2} className="w-16 rounded" />
											<div>
												<h6 className="text-sm text-gray-500">
													What you should know before...
												</h6>
												<p className="text-sm text-gray-500">by Emily Blunt</p>
											</div>
										</div>
										<div
											className="bg-white w-2.5 h-2.5 rotate-45 -z-10 rounded-[1px]"
											data-fc-arrow
										/>
									</div>
								}
							>
								<button
									className="border border-gray-300 rounded-md text-sm tracking-wider transition-all duration-300 hover:shadow-lg py-2 px-5"
									data-fc-placement="top"
									data-fc-type="tooltip"
								>
									Desktop App
									<i className="fa-solid fa-arrow-right ms-2" />
								</button>
							</Tippy>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Navigation
