import { Link } from 'react-router-dom'

//image
import logoDark from '@/assets/images/logo-dark.png'

const Footer = () => {
	return (
		<footer className="bg-gray-100">
			<div className="container">
				<div className="grid xl:grid-cols-5 gap-6 py-12">
					<div className="xl:col-span-2">
						<Link to="index.html">
							<img src={logoDark} className="h-8" />
						</Link>
						<p className="text-gray-500/80 mt-5 lg:w-4/5">
							Make your web application stand out with high-quality landing page
						</p>
					</div>
					<div className="xl:col-span-3 col-span-4">
						<div className="flex flex-col sm:flex-row gap-6 flex-wrap justify-between">
							<div>
								<div className="flex flex-col gap-3">
									<h5 className="mb-3 uppercase">Platform</h5>
									<div className="text-gray-500/80">
										<Link to="">Demo</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Pricing</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Integrations</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Status</Link>
									</div>
								</div>
							</div>
							<div>
								<div className="flex flex-col gap-3">
									<h5 className="mb-3 uppercase">Knowledge Base</h5>
									<div className="text-gray-500/80">
										<Link to="">Blog</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Help Center</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Sales Tools catalog</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">API</Link>
									</div>
								</div>
							</div>
							<div>
								<div className="flex flex-col gap-3">
									<h5 className="mb-3 uppercase">Company</h5>
									<div className="text-gray-500/80">
										<Link to="">About us</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Career</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Contact Us</Link>
									</div>
								</div>
							</div>
							<div>
								<div className="flex flex-col gap-3">
									<h5 className="mb-3 uppercase">Legal</h5>
									<div className="text-gray-500/80">
										<Link to="">Usage Policy</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Privacy Policy</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Terms of Service</Link>
									</div>
									<div className="text-gray-500/80">
										<Link to="">Trust</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="border-t py-6">
					<div className="grid sm:grid-cols-2 text-center sm:text-start gap-6">
						<div>
							<p className="text-gray-500/80 text-sm">
								{new Date().getFullYear()}© Prompt. All rights reserved.
								Crafted by{' '}
								<Link
									to=""
									className="text-gray-800 hover:text-primary transition-all"
								>
									Coderthemes
								</Link>
							</p>
						</div>
						<div className="flex justify-center sm:justify-end gap-7">
							<div>
								<Link to="">
									<svg
										className="w-5 h-5 text-gray-500 hover:text-primary transition-all"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
									</svg>
								</Link>
							</div>
							<div>
								<Link to="">
									<svg
										className="w-5 h-5 text-gray-500 hover:text-primary transition-all"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
									</svg>
								</Link>
							</div>
							<div>
								<Link to="">
									<svg
										className="w-5 h-5 text-gray-500 hover:text-primary transition-all"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
										<rect x="2" y="9" width="4" height="12"></rect>
										<circle cx="4" cy="4" r="2"></circle>
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
export default Footer
