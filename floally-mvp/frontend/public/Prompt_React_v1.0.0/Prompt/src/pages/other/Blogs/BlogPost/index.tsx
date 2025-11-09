import { Footer3 } from '@/components'
import Comments from './Comments'
import Hero from './Hero'
import PostContent from './PostContent'
import PostNavigation from './PostNavigation'

const BlogPost = () => {
	return (
		<>
			<div className="text-gray-700">
				<Hero />

				<PostContent />

				<PostNavigation />

				<Comments />

				<Footer3 />
			</div>
		</>
	)
}

export default BlogPost
