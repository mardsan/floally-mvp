//images
import img1 from '@/assets/images/photos/14.jpg'

const Feature = () => {
	return (
		<section className="lg:py-24 py-16">
			<div className="container" data-aos="fade-up">
				<div className="grid lg:grid-cols-2 gap-14">
					<div className="order-2 lg:order-1">
						<h1 className="text-3xl mb-7">Build amazing things together</h1>
						<p className="text-sm/relaxed tracking-wider text-gray-600 mb-5">
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem
							accusantium doloremque laudantium totam rem aperiam beatae vitae
							dicta sunt explicabo.
						</p>
						<p className="text-sm/relaxed tracking-wider text-gray-600 mb-7">
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem
							accusantium doloremque laudantium totam rem aperiam beatae vitae
							dicta sunt explicabo.
						</p>
						<div className="flex items-center">
							<a href="#" className="text-primary">
								Learn more <i className="fa-solid fa-arrow-right ms-2" />
							</a>
						</div>
					</div>
					<div className="order-1 lg:order-2">
						<img src={img1} alt="photo-3" />
					</div>
				</div>
			</div>
		</section>
	)
}

export default Feature
