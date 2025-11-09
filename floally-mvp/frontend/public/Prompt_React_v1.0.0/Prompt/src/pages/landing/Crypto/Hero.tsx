import { FormInput } from '@/components'
import { Link } from 'react-router-dom'
import Typist from 'react-text-typist'

//image
import crypto from '@/assets/images/hero/crypto.png'

const Hero = () => {
	return (
		<section className="pt-40 pb-20 bg-primary/5 relative overflow-hidden">
			<div className="container">
				<div className="grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
					<div>
						<h1 className="md:text-5xl/tight text-3xl font-semibold mb-7">
							The&nbsp;
							<span className="relative after:bg-green-200 md:after:h-6 after:h-4 after:w-full after:inset-x-0 after:bottom-0 after:absolute after:-z-10">
								Fastest
							</span>{' '}
							&amp; Secure way to Buy, Sell and Trade with&nbsp;
							<span className="typewrite">
								<Typist
									sentences={['Crypto', 'NFT']}
									typingSpeed={1500}
									deletingSpeed={700}
									showCursor={false}
									startDelay={100}
									cursorSmooth
									pauseTime={2500}
								/>
							</span>
						</h1>
						<p className="text-slate-500 leading-7">
							A seamless, flexible and diverse platform to buy, sell and manage
							your cryptocurrency portfolio
						</p>
						<div className="py-14">
							<div className="flex flex-wrap items-center gap-4">
								<FormInput
									name="Email"
									type="email"
									placeholder="Enter Your Email"
									className="form-input pe-10 text-sm font-medium focus:ring-0 focus:border-slate-500 rounded border-slate-400"
								/>
								<Link
									to=""
									className="py-2 px-4 rounded text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500"
								>
									Get Started
								</Link>
							</div>
							<p
								className="text-slate-4
            00 mt-2"
							>
								Already using Prompt?&nbsp;
								<Link to="" className="text-slate-800 hover:text-primary">
									Log In
								</Link>
							</p>
						</div>
					</div>
					<div className="2xl:w-[130%] relative ms-20">
						<div className="p-3 rounded-md bg-white shadow-lg">
							<img src={crypto} className="rounded-md" />
						</div>
						<div className="hidden sm:block">
							<div className="after:w-32 after:h-32 after:absolute after:-bottom-10 after:-start-12 after:-z-10 after:bg-[url('@/assets/images/pattern/dot2.svg')]" />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Hero
