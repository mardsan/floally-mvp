import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'

// components
import { FormInput, VerticalForm } from '@/components'

// form validation
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

interface UserData {
	email: string
	password: string
}

/*
form validation schema
*/
const schemaResolver = yupResolver(
	yup.object().shape({
		email: yup.string().required('Please enter Username'),
		password: yup.string().required('Please enter Password'),
	})
)
const BottomLink = () => {
	return (
		<div className="w-full text-center">
			<p className="text-gray-500 leading-6 text-base">
				Don't have an account?{' '}
				<Link
					to="/pages/account/register"
					className="text-primary font-semibold ms-1"
				>
					Sign Up
				</Link>
			</p>
		</div>
	)
}
const Login = () => {
	return (
		<AuthLayout
			authTitle="Welcome back!"
			helpText="Enter your email address and password to access admin panel."
			bottomLinks={<BottomLink />}
		>
			<VerticalForm<UserData>
				onSubmit={() => {
					null
				}}
				resolver={schemaResolver}
				defaultValues={{ email: 'prompt@coderthemes.com', password: 'prompt' }}
			>
				<FormInput
					name="email"
					type="email"
					label="Email"
					labelClassName="block text-sm font-medium mb-1 text-gray-600"
					className="py-2 px-4 leading-6 block w-full border-gray-300 rounded text-sm focus:border-gray-300 focus:ring-0"
					containerClass="mb-4"
					placeholder="Your Name"
					required
				/>

				<FormInput
					label="Password"
					type="password"
					name="password"
					placeholder="Enter your password"
					className="py-2 px-4 leading-6 block w-full border-gray-300 rounded rounded-e-none text-sm focus:border-gray-300 focus:ring-0"
					containerClass="mb-4"
					labelClassName="block text-sm font-medium mb-1 text-gray-600"
					labelContainerClassName="flex justify-between items-center mb-0"
					required
				>
					<Link
						to="/pages/account/forget-password"
						className="float-right text-gray-500 text-xs border-b border-dashed pb-1 ms-1"
					>
						Forgot your password?
					</Link>
				</FormInput>
				<FormInput
					label="Remember me"
					type="checkbox"
					name="checkbox"
					className="shrink-0 border-gray-400 rounded text-blue-600"
					containerClass="flex items-center mb-4"
					labelClassName="text-xs/none text-gray-700 font-medium ms-3"
					defaultChecked
				/>
				<div className="mb-0 text-center">
					<button
						className="w-full bg-primary text-white font-medium leading-6 text-center align-middle select-none py-2 px-4 text-base rounded-md transition-all hover:shadow-lg hover:shadow-primary/30"
						type="submit"
					>
						Log In
					</button>
				</div>
			</VerticalForm>
		</AuthLayout>
	)
}

export default Login
