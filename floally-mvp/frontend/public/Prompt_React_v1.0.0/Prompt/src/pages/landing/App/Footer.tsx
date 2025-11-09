import { Link } from 'react-router-dom'

//images
import google from '@/assets/images/buttons/google.png'
import store from '@/assets/images/buttons/store.png'
import logoDark from '@/assets/images/logo-dark.png'

const Footer = () => {
	return (
		<section className="py-10">
			<div className="container">
				<div className="text-center">
					<div>
						<h2 className="md:text-3xl text-xl font-semibold my-5">
							Start offering your users a better experience
						</h2>
						<p className="text-slate-500">
							Start working with <span className="text-primary">Prompt</span> to
							showcase your app to thousands of people.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-4 my-10">
							<Link to="">
								<img src={google} className="w-48" />
							</Link>
							<Link to="">
								<img src={store} className="w-48" />
							</Link>
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
									Privacy
								</Link>
							</li>
							<li className="after:content-['-'] after:text-slate-500 after:font-extrabold">
								<Link to="" className="hover:text-primary me-4">
									Terms
								</Link>
							</li>
							<li className="after:content-['-'] after:text-slate-500 after:font-extrabold">
								<Link to="" className="hover:text-primary me-4">
									Developers
								</Link>
							</li>
							<li className="after:content-['-'] after:text-slate-500 after:font-extrabold">
								<Link to="" className="hover:text-primary me-4">
									Support
								</Link>
							</li>
							<li>
								<Link to="" className="hover:text-primary">
									Careers
									<span className="px-2 py-1 text-xs rounded-full text-primary bg-primary/10">
										We're hiring
									</span>
								</Link>
							</li>
						</ul>

						<p className="my-5">
							<script>document.write(new Date().getFullYear())</script> ©
							Prompt. All rights reserved. Crafted by
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

export default Footer
