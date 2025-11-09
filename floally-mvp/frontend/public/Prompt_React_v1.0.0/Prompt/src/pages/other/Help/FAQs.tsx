import { FAQContent, FUCollapse } from '@/components'
import { useState } from 'react'

const FAQs = () => {
	const [basicAccordion, setBasicAccordion] = useState<number | null>(0)

	const handleBasicAccordion = (index: number) => () => {
		if (index === basicAccordion) setBasicAccordion(null)
		else setBasicAccordion(index)
	}
	return (
		<>
			<h4 className="text-base mt-24">Frequently Asked Questions</h4>
			<p className="text-slate-400 mt-1">
				Here are some of the basic types of questions for our customers
			</p>
			<div className="mt-10 lg:me-36">
				<div data-fc-type="accordion">
					{(FAQContent || []).map((item, idx) => {
						return (
							<FUCollapse
								key={idx}
								open={basicAccordion == idx}
								toggleCollapse={handleBasicAccordion(idx)}
							>
								<div className={`rounded border ${idx === 0 ? '' : 'mt-2'}`}>
									<FUCollapse.Toggle
										className="sm:text-base p-5 inline-flex items-center gap-x-3 w-full font-medium text-gray-800 transition hover:text-gray-500"
										data-fc-type="collapse"
									>
										{item.title}
										<span className="fa-solid fa-angle-down ms-auto transition-all fc-collapse-open:-rotate-90" />
									</FUCollapse.Toggle>
									<FUCollapse.Menu className="w-full overflow-hidden transition-[height] duration-300 ">
										<p className="sm:text-sm font-medium text-gray-500 p-5 pt-0">
											{item.description}
										</p>
									</FUCollapse.Menu>
								</div>
							</FUCollapse>
						)
					})}
				</div>
			</div>
		</>
	)
}

export default FAQs
