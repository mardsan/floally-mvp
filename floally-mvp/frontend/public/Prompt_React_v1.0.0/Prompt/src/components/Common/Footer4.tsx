import { Link } from 'react-router-dom'

const Footer4 = () => {
	return (
		<section className="bg-white py-6 relative">
			<div className="container">
				<div className="flex items-center flex-wrap">
					<div className="grow">
						<div className="flex items-center gap-3">
							<div className="inline-flex items-center">
								<Link to="">
									About <i className="fa-solid fa-minus text-sm" />
								</Link>
							</div>
							<div className="inline-flex items-center">
								<Link to="">
									Privacy <i className="fa-solid fa-minus text-sm" />
								</Link>
							</div>
							<div className="inline-flex items-center">
								<Link to="">
									Terms <i className="fa-solid fa-minus text-sm" />
								</Link>
							</div>
							<div className="inline-flex items-center">
								<Link to="">
									Developers <i className="fa-solid fa-minus text-sm" />
								</Link>
							</div>
							<div className="inline-flex items-center">
								<Link to="">
									Support <i className="fa-solid fa-minus text-sm" />
								</Link>
							</div>
							<div className="inline-flex items-center">
								<Link to="">
									Careers
									<span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
										We're hiring
									</span>
								</Link>
							</div>
						</div>
					</div>
					<div className="shrink md:text-end mt-4 lg:mt-0">
						<p className="text-sm mb-0">
							{' '}
							{new Date().getFullYear()} © Prompt. All rights reserved. Crafted
							by <Link to="https://coderthemes.com/">Coderthemes</Link>
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Footer4
