// types
import { Link } from 'react-router-dom'
import { Coin } from './types'

type CoinsProps = {
	coins: Coin[]
}

const Coins = ({ coins }: CoinsProps) => {
	return (
		<section className="py-20" data-aos="fade-up">
			<div className="container">
				<div className="text-center">
					<h1 className="text-3xl font-medium">Supported coins</h1>
					<p className="font-medium text-slate-500 mt-5 mb-4">
						Fastest way to buy or sell
						<span className="text-slate-900">popular</span> crypto coins.
					</p>
				</div>
				<div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-x-5 gap-y-14 mt-16">
					{(coins || []).map((coin, idx) => {
						return (
							<div className="flex items-center gap-5" key={idx}>
								<div
									className={`h-12 w-12 ${coin.variant} rounded-full flex items-center justify-center`}
								>
									<i
										className={`${
											coin.isSolid
												? `fa-solid ${coin.icon}`
												: `fa-brands ${coin.icon}`
										} ${idx === 0 ? '' : 'text-white'} ${
											coin.size ? `${coin.size}` : 'text-2xl'
										}`}
									/>
								</div>
								<h4 className="text-base">{coin.name}</h4>
							</div>
						)
					})}
				</div>
				<div className="text-center mt-16">
					<Link
						to=""
						className="py-3 px-6 rounded border border-primary text-white bg-primary hover:shadow-lg hover:shadow-primary/50 focus:outline focus:outline-primary/50 transition-all duration-500"
					>
						View complete list <i className="fa-solid fa-arrow-right ms-2" />
					</Link>
				</div>
			</div>
		</section>
	)
}

export default Coins
