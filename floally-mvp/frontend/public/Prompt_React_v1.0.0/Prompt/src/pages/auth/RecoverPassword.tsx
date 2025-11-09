import { FormInput, VerticalForm } from '@/components'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'

import logoDark from '@/assets/images/logo-dark.png'

interface UserData {
	email: string
}
// * form validation schema
const schemaResolver = yupResolver(
	yup.object().shape({
		email: yup.string().required('Please enter email'),
	})
)

const RecoverPassword = () => {
	useEffect(() => {
		if (document.body) {
			document.body.classList.add('bg-slate-100', 'tracking-wide')
		}

		return () => {
			if (document.body) {
				document.body.classList.remove('bg-slate-100', 'tracking-wide')
			}
		}
	}, [])
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="container">
				<div>
					<div className="lg:w-1/2 mx-auto mb-6">
						<div className="bg-white shadow-md p-12 rounded-s col-span-6">
							<div className="mb-12">
								<Link to="/">
									<img src={logoDark} alt="logo-img" className="h-8" />
								</Link>
							</div>
							<h6 className="text-base/[1.6] font-semibold text-gray-600 mb-0 mt-4">
								Reset Password
							</h6>
							<p className="text-gray-500 text-sm/[1.6] mt-1 mb-6">
								Enter your email address and we'll send you an email with
								instructions to reset your password.
							</p>
							<VerticalForm<UserData>
								onSubmit={() => {
									null
								}}
								resolver={schemaResolver}
							>
								<FormInput
									name="email"
									label="Email"
									containerClass="mb-4"
									labelClassName="block text-sm font-medium mb-1 text-gray-600"
									className="py-2 px-4 leading-6 block w-full border-gray-300 rounded text-sm focus:border-gray-300 focus:ring-0"
									placeholder="Email"
								/>
								<div className="pt-4 text-center">
									<button
										className="w-full bg-primary text-white font-medium leading-6 text-center align-middle select-none py-2 px-4 text-base rounded-md transition-all hover:shadow-lg hover:shadow-primary/30"
										type="submit"
									>
										Submit
									</button>
								</div>
							</VerticalForm>
						</div>
					</div>
					<div className="w-full text-center">
						<p className="text-gray-500 leading-6 text-base">
							Back to{' '}
							<Link
								to="/pages/account/login"
								className="text-primary font-semibold ms-1"
							>
								Log In
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RecoverPassword
