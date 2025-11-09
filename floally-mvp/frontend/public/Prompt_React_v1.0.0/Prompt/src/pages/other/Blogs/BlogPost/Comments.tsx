import { Link } from 'react-router-dom'
import AddComment from './AddComment'

//images
import avatar1 from '@/assets/images/avatars/img-1.jpg'
import avatar2 from '@/assets/images/avatars/img-2.jpg'
import avatar4 from '@/assets/images/avatars/img-4.jpg'

const Comments = () => {
	return (
		<section className="lg:py-24 py-14">
			<div className="container">
				<div className="flex items-center gap-2">
					<h1 className="tracking-wider">Comments</h1>
					<span className="bg-gray-200 px-2 rounded-md">3</span>
				</div>
				<div>
					<div className="flex gap-3 my-6">
						<img src={avatar4} className="h-11 w-11 rounded-md" />
						<div>
							<h6 className="text-sm mb-1">Sansa Stark</h6>
							<p className="text-sm text-gray-500">2 days ago</p>
							<p className="text-sm/relaxed tracking-wider text-gray-600 mt-2">
								At vero eos et accusamus et iusto odio dignissimos ducimus qui
								blanditiis praesentium voluptatum deleniti atque.
							</p>
							<Link to="" className="text-primary text-sm">
								<i className="fa-regular fa-comment me-1" /> Reply
							</Link>
							<div className="flex gap-3 my-6">
								<img src={avatar1} className="h-11 w-11 rounded-md" />
								<div>
									<h6 className="text-sm mb-1">Cersei Lannister</h6>
									<p className="text-sm text-gray-500">1 days ago</p>
									<p className="text-sm/relaxed tracking-wider text-gray-600 mt-2">
										Itaque earum rerum hic tenetur sapiente delectus aut
										reiciendis voluptatibus maiores alias consequatur aut
										perferendis
									</p>
									<Link to="" className="text-primary text-sm">
										<i className="fa-regular fa-comment me-1" /> Reply
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="border-b" />
					<div className="flex gap-3 my-6">
						<img src={avatar2} className="h-11 w-11 rounded-md" />
						<div>
							<h6 className="text-sm mb-1">Sansa Stark</h6>
							<p className="text-sm text-gray-500">2 days ago</p>
							<p className="text-sm/relaxed tracking-wider text-gray-600 mt-2">
								At vero eos et accusamus et iusto odio dignissimos ducimus qui
								blanditiis praesentium voluptatum deleniti atque.
							</p>
							<a href="" className="text-primary text-sm">
								<i className="fa-regular fa-comment me-1" /> Reply
							</a>
						</div>
					</div>
				</div>
				<AddComment />
			</div>
		</section>
	)
}

export default Comments
