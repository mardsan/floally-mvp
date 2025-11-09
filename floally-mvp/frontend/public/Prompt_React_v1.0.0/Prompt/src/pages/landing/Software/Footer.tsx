import { FormInput } from '@/components'
import { Link } from 'react-router-dom'

//images
import logoDark from '@/assets/images/logo-dark.png'

const Footer = () => {
	return (
		<footer className="pt-10 pb-6">
			<div className="container">
				<div className="text-center">
					<h2 className="text-3xl/tight font-medium my-5">
						Be the first to know!
					</h2>
					<p className="text-gray-500">
						We'll inform you about new updates, features, but no spam, we
						promise.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-2 my-10">
						<FormInput
							type="email"
							name="Email"
							placeholder="Your email"
							className="text-sm rounded border-gray-200 focus:border-gray-400 focus:ring-0 bg-transparent py-2 px-4"
							containerClass="flex items-center gap-2"
						>
							<Link
								to=""
								className="w-full py-2 px-4 rounded text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50"
							>
								Sign Up
							</Link>
						</FormInput>
					</div>
				</div>
			</div>
			<div className="border-b" />
			<div className="container">
				<div className="text-center mt-10">
					<p className="text-gray-600 mb-7">
						{new Date().getFullYear()}© Prompt. All rights reserved. Crafted by{' '}
						<Link
							to=""
							className="text-gray-800 hover:text-primary transition-all"
						>
							Coderthemes
						</Link>
					</p>
					<ul className="flex flex-wrap items-center justify-center gap-10 mb-8">
						<li>
							<Link to="">Changelog</Link>
						</li>
						<li>
							<Link to="">FAQ</Link>
						</li>
						<li>
							<Link to="">Press kit</Link>
						</li>
						<li>
							<Link to="">Contact us</Link>
						</li>
						<li>
							<Link to="" className="hover:text-primary">
								Careers&nbsp;
								<span className="px-2 py-1 text-xs rounded-full text-primary bg-primary/10">
									We're hiring
								</span>
							</Link>
						</li>
					</ul>
					<Link to="/">
						<img src={logoDark} className="h-8 mx-auto" />
					</Link>
				</div>
			</div>
		</footer>
	)
}

export default Footer
