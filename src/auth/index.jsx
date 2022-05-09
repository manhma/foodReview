import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import logo from '../assets/images/logo.jpg'
import { auth } from '../firebase/config'
import './css/login.css'

export default function Login() {
	const history = useHistory()
	const [isLoadingButton, setIsLoadingButton] = useState(false)
	const onFinish = async (values) => {
		const email = values.username + '@gmail.com'
		setIsLoadingButton(true)
		try {
			await auth.signInWithEmailAndPassword(email, values.password)
			setIsLoadingButton(false)
			history.push('/')
		} catch (error) {
			console.log(error)
			if (error.code === 'auth/wrong-password')
				message.error('Thông tin mật khẩu không đúng!')
			if (error.code === 'auth/user-not-found')
				message.error('Thông tin tài khoản không đúng!')
			if (error.code === 'auth/user-disabled')
				message.error(
					'Tài khoản người dùng đã bị vô hiệu hóa bởi quản trị viên!'
				)
			setIsLoadingButton(false)
		}
	}
	useEffect(() => {
		auth.signOut()
	}, [])

	return (
		<div className='login'>
			<div className='login_image'>
				<img
					src='https://i.pinimg.com/originals/38/6f/47/386f47c88a7aaa497ec6edc1c02cc9b6.jpg'
					alt='background_image'
					style={{
						width: '100%',
						height: '100%',
					}}
				/>
			</div>

			<div className='container_login'>
				<img
					// src='https://bom.to/vYqslfgaSRqjCG'
					src={logo}
					alt='logo'
					style={{
						width: '100%',
						height: 'auto',
						margin: '50px auto 30px auto',
					}}
				/>
				<Form
					name='normal_login'
					className='login-form'
					initialValues={{
						remember: true,
					}}
					onFinish={onFinish}
				>
					<Form.Item
						style={{
							textAlign: 'left',
						}}
						name='username'
						rules={[
							{
								required: true,
								message: 'Nhập tên tài khoản của bạn!',
							},
							{
								message: 'Tên đăng nhập không hợp lệ!',
								validator: (_, value) => {
									const reg = /^[a-zA-Z0-9]+$/
									if (reg.test(value) || value === '') {
										return Promise.resolve()
									}
									return Promise.reject()
								},
							},
						]}
					>
						<Input
							prefix={<UserOutlined className='site-form-item-icon' />}
							placeholder='Tên đăng nhập'
						/>
					</Form.Item>
					<Form.Item
						style={{
							textAlign: 'left',
						}}
						name='password'
						rules={[
							{
								required: true,
								message: 'Nhập mật khẩu!',
							},
						]}
					>
						<Input
							prefix={<LockOutlined className='site-form-item-icon' />}
							type='password'
							placeholder='Mật khẩu'
						/>
					</Form.Item>

					<Form.Item>
						<Button
							loading={isLoadingButton}
							style={{
								width: '100%',
								backgroundColor: 'tomato',
								color: 'white',
							}}
							htmlType='submit'
							className='login-form-button'
						>
							Đăng nhập
						</Button>
					</Form.Item>
					<Divider />
					<Form.Item>
						<Button
							style={{
								width: '50%',
								backgroundColor: 'green',
								color: 'white',
							}}
							className='login-form-button'
							onClick={() => {
								history.push('/register')
							}}
						>
							Tạo tài khoản mới
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	)
}
