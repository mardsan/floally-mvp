// types
import React from 'react'
import { Vacancy } from './types'
import { Link } from 'react-router-dom'

type VacancyProps = {
	vacancies: Vacancy[]
}

const Vacancies = ({ vacancies }: VacancyProps) => {
	return (
		<section className="lg:py-24 py-16">
			<div>
				<div className="container">
					<div className="text-center">
						<h1 className="text-3xl font-medium mb-4">Job Openings</h1>
						<p className="text-gray-500">
							Interested? Come show us what you're made of!
						</p>
					</div>

					{(vacancies || []).map((vacancy, idx) => {
						return (
							<div className="mt-14" key={idx}>
								<h1 className="text-2xl font-medium mb-8">
									{vacancy.category}
								</h1>
								{(vacancy.jobs || []).map((job, idx) => {
									return (
										<React.Fragment key={idx}>
											<div className="flex justify-between my-5">
												<div>
													<Link
														to=""
														className="transition-all hover:text-primary"
													>
														{job.designation}
													</Link>
												</div>
												<div>
													<Link to="" className="text-gray-500">
														{job.type}
													</Link>
												</div>
											</div>
											<div className="border-b" />
										</React.Fragment>
									)
								})}
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

export default Vacancies
