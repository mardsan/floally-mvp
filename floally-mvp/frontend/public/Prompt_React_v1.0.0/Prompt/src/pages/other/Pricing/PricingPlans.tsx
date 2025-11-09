import { PricingCards2 } from '@/components'
import { plans } from './data'

const PricingPlans = () => {
	return (
		<section className="py-20">
			<div className="container">
				<div className="text-center max-w-2xl mx-auto">
					<span className="text-sm font-medium py-1 px-3 rounded-full text-primary bg-primary/10">
						Plans
					</span>
					<h2 className="md:text-3xl/tight text-3xl font-semibold my-4">
						Pricing Plans
					</h2>
					<p className="md:text-lg text-slate-500 leading-7">
						Pricing that <span className="text-primary">works</span> for
						everyone.
					</p>
				</div>
				{/* <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6 items-center mt-16">
          <div>
            <div className="border p-6 text-center rounded hover:shadow-lg">
              <h4 className="text-lg text-primary">Starter</h4>
              <h1 className="mt-3 mb-8">
                <sup className="align-super text-sm text-slate-500">$</sup>
                <span className="text-3xl font-semibold">49</span>
                <sub className="text-sm text-slate-500">/ month</sub>
              </h1>
              <hr />
              <div className="grid gap-y-4 mt-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Up to 600 minutes usage time</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Use for personal only</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Add up to 10 attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Technical support via email</span>
                </div>
              </div>
              <div className="mt-24">
                <a href="#" className="py-3 px-6 flex items-center justify-center rounded hover:border hover:border-primary/50 text-primary bg-primary/10 transition-all duration-500">Sign Up Now</a>
              </div>
            </div>
          </div>
          <div>
            <div className="border p-6  rounded hover:shadow-lg relative">
              <div className="absolute w-full h-[188px] -z-10 top-0 left-0 overflow-hidden">
                <span className="absolute transform rotate-45 bg-primary text-center text-white font-medium py-1 right-[-52px] top-[23px] w-[170px] h-5 z-[2] text-xs overflow-hidden border border-dashed leading-[8px] border-white shadow-[0_0_0_3px] shadow-primary/40">Popular</span>
              </div>
              <h4 className="text-lg text-primary text-center">Professional</h4>
              <h1 className="mt-3 mb-8 text-center">
                <sup className="align-super text-sm text-slate-500">$</sup>
                <span className="text-3xl font-semibold">99</span>
                <sub className="text-sm text-slate-500">/ month</sub>
              </h1>
              <hr />
              <div className="grid gap-y-4 mt-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Up to 6000 minutes usage time</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Use for personal or a commercial client</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Add up to 100 attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Up to 5 teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Technical support via email</span>
                </div>
              </div>
              <div className="mt-14">
                <a href="#" className="py-3 px-6 flex items-center justify-center rounded hover:border hover:border-primary/50 text-primary bg-primary/10 transition-all duration-500">Sign Up Now</a>
              </div>
            </div>
          </div>
          <div>
            <div className="border p-6  rounded hover:shadow-lg">
              <h4 className="text-lg text-primary text-center">Enterprise</h4>
              <h1 className="mt-3 mb-8 text-center">
                <sup className="align-super text-sm text-slate-500">$</sup>
                <span className="text-3xl font-semibold">599</span>
                <sub className="text-sm text-slate-500">/ month</sub>
              </h1>
              <hr />
              <div className="grid gap-y-4 mt-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Unlimited usage time</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Use for personal or a commercial client</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Add Unlimited attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>24x7 Technical support via phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Technical support via email</span>
                </div>
              </div>
              <div className="mt-14">
                <a href="#" className="py-3 px-6 flex items-center justify-center rounded hover:border hover:border-primary/50 text-primary bg-primary/10 transition-all duration-500">Sign Up Now</a>
              </div>
            </div>
          </div>
        </div> */}
				<PricingCards2 plans={plans} />
			</div>
		</section>
	)
}

export default PricingPlans
