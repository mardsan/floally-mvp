import React from 'react'
import { Route, RouteProps, Routes } from 'react-router-dom'

import {
	authProtectedFlattenRoutes,
	publicProtectedFlattenRoutes,
	// publicProtectedFlattenRoutes
} from '.'
import HorizontalLayout from '../layouts/HorizontalLayout'
import DefaultLayout from '../layouts/Default'

const AllRoutes = (props: RouteProps) => {
	return (
		<React.Fragment>
			<Routes>
				<Route>
					{publicProtectedFlattenRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								<DefaultLayout {...props}>{route.element}</DefaultLayout>
							}
							key={idx}
						/>
					))}
					;
				</Route>

				<Route>
					{authProtectedFlattenRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								<HorizontalLayout {...props}>{route.element}</HorizontalLayout>
							}
							key={idx}
						/>
					))}
					;
				</Route>
			</Routes>
		</React.Fragment>
	)
}

export default AllRoutes
