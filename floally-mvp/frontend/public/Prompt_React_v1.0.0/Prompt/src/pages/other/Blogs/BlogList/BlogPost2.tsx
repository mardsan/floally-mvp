import { Link } from 'react-router-dom'
import { Post } from './data'

type BlogPostProps = {
	post: Post
}
const BlogPost2 = ({ post }: BlogPostProps) => {
	return (
		<div>
			<img src={post.image} className="rounded-md mb-5" />
			<span
				className={`${post.tag.variant} font-medium rounded-md text-xs py-1 px-2`}
			>
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
	)
}

export default BlogPost2
