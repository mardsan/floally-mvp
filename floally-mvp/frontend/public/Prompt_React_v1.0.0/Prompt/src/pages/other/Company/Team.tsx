// types
import { TeamMember } from './types'

type TeamProps = {
	teamMembers: TeamMember[]
}

const Team = ({ teamMembers }: TeamProps) => {
	return (
		<section className="lg:py-24 py-16">
			<div className="container">
				<div className="text-center">
					<span className="text-sm bg-primary/10 text-primary/40 rounded-full px-3 py-1">
						Our Team
					</span>
					<h1 className="text-3xl/tight font-medium mt-3 mb-4">
						Meet Our Team
					</h1>
					<p className="text-gray-500">
						Start working with<span className="text-primary"> Prompt </span>to
						manage your workforce better.
					</p>
				</div>
				<div className="mt-14">
					<div
						className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-12"
						data-aos="fade-up"
					>
						{(teamMembers || []).map((teamMember, idx) => {
							return (
								<div key={idx}>
									<div className="flex gap-4 items-center">
										<img
											src={teamMember.avatar}
											alt="avatar"
											className="h-16 w-16 rounded-md"
										/>
										<div>
											<h6 className="font-medium">{teamMember.name}</h6>
											<p className="text-gray-500">{teamMember.designation}</p>
										</div>
									</div>
								</div>
							)
						})}
						{/* <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-2.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Danette Payne</h6>
                  <p className="text-gray-500">CTO</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-3.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Tammy Ward</h6>
                  <p className="text-gray-500">VP, Product Development</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-4.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Paul Moore</h6>
                  <p className="text-gray-500">Back-End Developer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-5.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Harry Burris</h6>
                  <p className="text-gray-500">PHP Developer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-6.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Patricia Ferraro</h6>
                  <p className="text-gray-500">Web Designer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-7.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Robert Smith</h6>
                  <p className="text-gray-500">Graphic Designer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-8.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Lindsay Clark</h6>
                  <p className="text-gray-500">Web Designer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-1.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Lindsay Clark</h6>
                  <p className="text-gray-500">Front-End Developer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-2.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Ernest Griffith</h6>
                  <p className="text-gray-500">PHP Developer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-3.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Cecelia Poole</h6>
                  <p className="text-gray-500">Back-End Developer</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 items-center">
                <img src="assets/images/avatars/img-4.jpg" alt="avatar" className="h-16 w-16 rounded-md" />
                <div>
                  <h6 className="font-medium">Morris Hall</h6>
                  <p className="text-gray-500">Graphic Designer</p>
                </div>
              </div>
            </div> */}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Team
