// types
import { WorkImages } from '../types'

type ContentProps = {
	workImages: WorkImages[]
}

//image
import heroPost from '@/assets/images/blog/hero-post.png'
import Img1 from '@/assets/images/photos/13.jpg'
import Img2 from '@/assets/images/photos/14.jpg'
const Content = ({ workImages }: ContentProps) => {
	return (
		<section className="pb-20">
			<div className="container">
				<div className="text-center">
					{/* image */}
					<div>
						<img src={heroPost} className="rounded-md" />
					</div>
					{/* image caption */}
					<p className="text-sm text-slate-400 mt-2">
						The image caption referencing the above image
					</p>
				</div>
				{/* description start */}
				<div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-16">
					<div>
						<h3 className="text-2xl">About Client</h3>
						<p className="mt-5">
							Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit
							officia neque beatae at inventore excepturi numquam sint commodi
							alias, quam consequuntur corporis ex, distinctio eaque sapiente
							pariatur iure ad necessitatibus in quod obcaecati natus
							consequatur. Sed dicta maiores, eos culpa.
						</p>
					</div>
					<div>
						<h3 className="text-2xl">Project Description</h3>
						<p className="mt-5">
							Voluptatum animi, voluptate sint aperiam facere a nam, ex
							reiciendis eum nemo ipsum nobis, rem illum cupiditate at quaerat
							amet qui recusandae hic, atque laboriosam perspiciatis? Esse
							quidem minima, voluptas necessitatibus, officia culpa quo nulla,
							cupiditate iste vel unde magni.
						</p>
					</div>
				</div>
				{/* description end */}
				{/* portfolio item images start */}
				<div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-16">
					<img src={Img2} className="rounded-md" />
					<img src={Img1} className="rounded-md" />
				</div>
				{/* portfolio item images end */}
				{/* work description start */}
				<div className="mt-16">
					<div>
						<h3 className="text-2xl">What We Did?</h3>
						<p className="text-slate-800 mt-4">
							Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit
							officia neque beatae at inventore excepturi numquam sint commodi
							alias, quam consequuntur corporis ex, distinctio eaque sapiente
							pariatur iure ad necessitatibus in quod obcaecati natus
							consequatur. Sed dicta maiores, eos culpa.
						</p>
					</div>
					<div className="grid md:grid-cols-3 grid-cols-1 gap-6 my-12">
						{(workImages || []).map((workImage, idx) => {
							return (
								<div className="flex items-center gap-5" key={idx}>
									<div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-md">
										{workImage.icon}
									</div>
									<div>
										<h5 className="text-base">{workImage.title}</h5>
									</div>
								</div>
							)
						})}
					</div>
					<p className="text-slate-800">
						{' '}
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit
						officia neque beatae at inventore excepturi numquam sint commodi
						alias, quam consequuntur corporis ex, distinctio eaque sapiente
						pariatur iure ad necessitatibus in quod obcaecati natus consequatur.
						Sed dicta maiores, eos culpa.
					</p>
					<h5 className="text-base mt-10">Technologies Used</h5>
					<p className="flex items-center gap-2 text-slate-700 font-medium mt-3">
						<i className="fa-solid fa-minus" />
						Sketch &amp; Illustrator
					</p>
					<p className="flex items-center gap-2 text-slate-700 font-medium mt-3">
						<i className="fa-solid fa-minus" />
						Raact JS
					</p>
					<p className="flex items-center gap-2 text-slate-700 font-medium mt-3">
						<i className="fa-solid fa-minus" />
						Django - A Web Framework in Python
					</p>
					<p className="flex items-center gap-2 text-slate-700 font-medium mt-3">
						<i className="fa-solid fa-minus" />
						PostgreSQL - Relational Database System
					</p>
				</div>
				{/* work description end */}
			</div>
		</section>
	)
}

export default Content
