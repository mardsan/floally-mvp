import { useState } from 'react'
import { FAQContent, FUCollapse } from '@/components'

const FAQs = () => {
	const [basicAccordion, setBasicAccordion] = useState<number | null>(0)

	const handleBasicAccordion = (index: number) => () => {
		if (index === basicAccordion) setBasicAccordion(null)
		else setBasicAccordion(index)
	}

	return (
		<section className="py-16 sm:py-24">
			<div className="container" data-aos="fade-up" data-aos-duration="2000">
				<div className="text-center">
					<span className="text-sm font-medium py-1 px-3 rounded-full text-primary bg-primary/10">
						FAQs
					</span>
					<h1 className="text-3xl/tight font-medium mt-3 mb-4">
						Frequently Asked Questions
					</h1>
					<p className="text-gray-500">
						Here are some of the basic types of questions for our customers
					</p>
				</div>

				<div
					data-fc-type="accordion"
					className="mt-14 lg:w-3/4 lg:mx-auto 2xl:w-2/3"
				>
					{(FAQContent || []).map((item, idx) => {
						return (
							<FUCollapse
								key={idx}
								open={basicAccordion == idx}
								toggleCollapse={handleBasicAccordion(idx)}
							>
								<div className="border border-gray-300 rounded-lg mt-4">
									<FUCollapse.Toggle
										className="inline-flex p-5 items-center justify-between w-full font-semibold text-left transition"
										data-fc-type="collapse"
									>
										{item.title}
										<span className="material-symbols-rounded text-xl block transition-all fc-collapse-open:rotate-180">
											<i className="fa-solid fa-angle-down"></i>
										</span>
									</FUCollapse.Toggle>
									<FUCollapse.Menu className="w-full overflow-hidden transition-[height] duration-300">
										<p className="text-gray-500 dark:text-gray-300 pt-3 p-5">
											{item.description}
										</p>
									</FUCollapse.Menu>
								</div>
							</FUCollapse>
						)
					})}
				</div>

				<div className="text-center mt-14">
					<p className="inline-flex flex-wrap gap-1 bg-gray-100 text-sm rounded-lg py-2 px-5">
						Still have unanswered questions?
						<a href="#" className="hover:text-primary transition-all">
							{' '}
							Contact Us
						</a>
					</p>
				</div>
			</div>
		</section>
	)
}

export default FAQs
