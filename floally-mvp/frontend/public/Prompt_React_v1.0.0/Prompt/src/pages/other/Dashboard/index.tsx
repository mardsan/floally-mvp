import { Footer4, Navbar, ScrollToTop } from '@/components'
import Statistic from './Statistic'
import RecentProjects from './RecentProjects'
import Task from './Task'

const Dashboard = () => {
	return (
		<>
			<Navbar />
			<div>
				<div className="bg-slate-100  mt-[77px]  py-3 px-3">
					<Statistic />
					<RecentProjects />
					<Task />
				</div>
				<Footer4 />
			</div>
			<ScrollToTop />
		</>
	)
}

export default Dashboard
