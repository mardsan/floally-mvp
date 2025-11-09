import { Link } from 'react-router-dom'

const PricingCards = () => {
	return (
		<>
			<div className="container relative">
				<div className="text-center">
					<span className="text-xs bg-primary/10 text-primary/90 rounded-full px-2 py-1">
						Plans
					</span>
					<h1 className="text-3xl/tight font-medium mb-4">Pricing</h1>
					<p className="text-gray-500">
						Pricing that <span className="text-primary">works </span> for
						everyone
					</p>
				</div>

				<div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7 mt-14">
					<div data-aos="fade-up" data-aos-duration="500">
						<div className="transition-all duration-300 pointer-events-auto hover:shadow-[0_0_1.5rem_0_rgba(0,0,0,.12)] hover:-translate-y-1">
							<div className="border border-gray-300 bg-white rounded w-full h-full text-center p-5">
								<span className="text-lg text-primary">Starter</span>
								<h1 className="text-3xl/tight font-semibold mt-3">
									<sup className="text-gray-500 text-sm font-normal">$</sup> 49{' '}
									<sub className="text-gray-500 text-sm font-normal">
										/month
									</sub>
								</h1>
								<div className="border-b border-gray-200 w-full my-7"></div>
								<div>
									<div className="flex flex-col gap-4">
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Up to 600 minutes usage time
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Use for personal only
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Add up to 10 attendees
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Technical support via email
										</p>
									</div>
									<div className="flex mt-[120px]">
										<Link
											to=""
											className="bg-primary/10 text-primary/90 w-full py-3 rounded-lg border border-transparent hover:border hover:border-primary/20 transition-all duration-300"
										>
											Purchase Now
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div data-aos="fade-up" data-aos-duration="700">
						<div className="transition-all duration-300 pointer-events-auto hover:shadow-[0_0_1.5rem_0_rgba(0,0,0,.12)] hover:-translate-y-1">
							<div className="border border-gray-300 bg-white rounded w-full h-full text-center p-5">
								<span className="text-lg text-primary">Professional</span>
								<h1 className="text-3xl/tight font-semibold mt-3">
									<sup className="text-gray-500 text-sm font-normal">$</sup> 99{' '}
									<sub className="text-gray-500 text-sm font-normal">
										/month
									</sub>
								</h1>
								<div className="border-b border-gray-200 w-full my-7"></div>
								<div>
									<div className="flex flex-col gap-4">
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Up to 6000 minutes usage time
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Use for personal or a commercial
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Add up to 100 attendees
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Up to 5 teams
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Technical support via email
										</p>
									</div>
									<div className="flex mt-20">
										<Link
											to=""
											className="bg-primary text-white w-full py-3 rounded-lg border border-transparent hover:shadow-lg hover:shadow-primary/30 focus:shadow-none focus:outline focus:outline-primary/40 hover:border hover:border-primary transition-all duration-300"
										>
											Purchase Now
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div data-aos="fade-up" data-aos-duration="900">
						<div className="transition-all duration-300 pointer-events-auto hover:shadow-[0_0_1.5rem_0_rgba(0,0,0,.12)] hover:-translate-y-1">
							<div className="border border-gray-300 bg-white rounded w-full h-full text-center p-5">
								<span className="text-lg text-primary">Enterprise</span>
								<h1 className="text-3xl/tight font-semibold mt-3">
									<sup className="text-gray-500 text-sm font-normal">$</sup> 599{' '}
									<sub className="text-gray-500 text-sm font-normal">
										/month
									</sub>
								</h1>
								<div className="border-b border-gray-200 w-full my-7"></div>
								<div>
									<div className="flex flex-col gap-4">
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Unlimited usage time
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Use for personal or a commercial
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Add Unlimited attendees
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											24x7 Technical support via phone
										</p>
										<p className="flex items-center text-gray-600 gap-4">
											<i className="fa-solid fa-check text-green-500 text-lg"></i>
											Technical support via email
										</p>
									</div>
									<div className="flex mt-20">
										<Link
											to=""
											className="bg-primary/10 text-primary/90 w-full py-3 rounded-lg border border-transparent hover:border hover:border-primary/20 transition-all duration-300"
										>
											Purchase Now
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default PricingCards
