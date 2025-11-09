import { Link } from 'react-router-dom'

//image
import logoDark from '@/assets/images/logo-dark.png'

const CTA = () => {
	return (
		<section className="py-10">
			<div className="container">
				<div className="text-center">
					<div>
						<h2 className="md:text-3xl text-xl font-semibold my-5">
							Start creating delightful user experience
						</h2>
						<p className="text-slate-500">
							Start working with <span className="text-primary">Prompt</span> to
							showcase your app to thousands of people.
						</p>
						<div className="my-14">
							<a
								href="#demo"
								className="py-3 px-6 rounded border border-primary text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500"
							>
								<i className="fa-solid fa-bag-shopping me-2" /> View Demos
							</a>
						</div>
					</div>
					<div>
						<ul className="flex flex-wrap items-center justify-center gap-5">
							<li className="after:content-['-'] after:text-slate-500 after:font-extrabold">
								<Link to="" className="hover:text-primary me-4">
									About
								</Link>
							</li>
							<li className="after:content-['-'] after:text-slate-500 after:font-extrabold">
								<Link to="" className="hover:text-primary me-4">
									Support
								</Link>
							</li>
							<li>
								<Link to="" className="hover:text-primary">
									Version&nbsp;
									<span className="px-2 py-1 text-xs rounded-full text-primary bg-primary/10">
										v1.0
									</span>
								</Link>
							</li>
						</ul>
						<p className="my-5">
							{new Date().getFullYear()} © Prompt. All rights reserved. Crafted
							by
						</p>
						<Link to="/">
							<img src={logoDark} className="h-8 mx-auto" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

export default CTA
