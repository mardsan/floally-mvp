import { Link } from 'react-router-dom'
import { Post } from './data'

type BlogPostProps = {
	post: Post
}

const BlogPost1 = ({ post }: BlogPostProps) => {
	return (
		<div className="lg:col-span-2">
			<div className="grid md:grid-cols-5 gap-10">
				<div className="md:col-span-2 col-span-3">
					<img src={post.image} className="w-full h-full rounded-md" />
				</div>
				<div className="col-span-3">
					<div className="flex flex-col gap-14 justify-between xl:h-full">
						<div>
							<span className="bg-orange-500/10 text-orange-500 font-medium rounded-md text-xs py-1 px-2">
								<Link to="">{post.tag.value}</Link>
							</span>
							<h1 className="text-lg my-3 transition-all hover:text-primary">
								<Link to="">{post.title}</Link>
							</h1>
							<p className="text-sm/relaxed tracking-wider text-gray-500">
								{post.description}{' '}
								<Link to="" className="text-primary">
									read more
								</Link>
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<img
									src={post.postedBy!.avatar}
									className="h-10 w-10 rounded-md"
								/>
								<div>
									<h6 className="text-sm transition-all hover:text-primary">
										<a href="#">{post.postedBy!.name}</a>
									</h6>
									<p className="text-sm text-gray-500">
										{post.postedOn!.date} · {post.postedOn!.time}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default BlogPost1
