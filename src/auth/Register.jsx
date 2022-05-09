import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import {
	Button,
	Divider,
	Form,
	Input,
	message,
	notification,
	Upload,
} from 'antd'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { auth } from '../firebase/config'
import { setDocument } from '../firebase/services'
import { IS_ACTIVE, ROLE } from '../utils/constants'
import './css/register.css'

const formItemLayout = {
	labelCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 8,
		},
	},
	wrapperCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 16,
		},
	},
}
const tailFormItemLayout = {
	wrapperCol: {
		xs: {
			span: 24,
			offset: 0,
		},
		sm: {
			span: 16,
			offset: 8,
		},
	},
}

function getBase64(img, callback) {
	const reader = new FileReader()
	reader.addEventListener('load', () => callback(reader.result))
	reader.readAsDataURL(img)
}

function beforeUpload(file) {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
	if (!isJpgOrPng) {
		message.error('Vui lòng nhập định dạng JPG/PNG!')
	}
	const isLt2M = file.size / 1024 / 1024 < 2
	if (!isLt2M) {
		message.error('Không nhập ảnh dung lượng lớn hơn 2MB!')
	}
	return isJpgOrPng && isLt2M
}

export default function Register() {
	const history = useHistory()
	const [form] = Form.useForm()
	const [isLoading, setIsLoading] = useState(false)
	const [upload, setUpload] = useState({
		loading: false,
		imageUrl: '',
	})
	const [image, setImage] = useState('')

	const handleChange = (info) => {
		if (info.file.status === 'uploading') {
			setUpload({
				imageUrl: '',
				loading: true,
			})
			return
		}

		if (info.file.status === 'done' || info.file.status === 'error') {
			getBase64(info.file.originFileObj, (imageUrl) => {
				setImage(imageUrl)
				setUpload({
					imageUrl: imageUrl,
					loading: false,
				})
			})
		}
	}

	const uploadButton = (
		<div>
			{upload.loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>Ảnh</div>
		</div>
	)

	const onFinish = async (values) => {
		const email = values.email + '@gmail.com'
		setIsLoading(true)
		try {
			const response = await auth.createUserWithEmailAndPassword(
				email,
				values.password
			)
			await setDocument('users', response.user.uid, {
				role: ROLE.USER,
				isActive: IS_ACTIVE.ACTIVE,
				displayName: values.nickname,
				userName: email,
				avatar: image,
				listPostSave: [],
				voucher: [],
			})
			setIsLoading(false)
			history.push('/')
			notification['success']({
				message: 'Thành công',
				duration: 2,
				description: 'Bạn đã đăng kí thành công tài khoản với hệ thống!',
			})
		} catch (error) {
			setIsLoading(false)
			console.log(error)
			if (error.code === 'auth/email-already-in-use')
				message.error('Tên đăng nhập này đã được sử dụng!')
		}
	}
	return (
		<div className='register'>
			<div className='register_image'>
				<img
					src='https://i.pinimg.com/originals/38/6f/47/386f47c88a7aaa497ec6edc1c02cc9b6.jpg'
					alt='bgimage'
					style={{
						width: '100%',
						height: '100%',
					}}
				/>
			</div>
			<Form
				{...formItemLayout}
				form={form}
				name='register'
				onFinish={onFinish}
				scrollToFirstError
				className='register_form'
				labelAlign='left'
			>
				<h1 style={{ textAlign: 'center' }}>Đăng kí</h1>
				<Divider />

				<Form.Item
					name='nickname'
					label='Tên người dùng'
					rules={[
						{
							required: true,
							message: 'Vui lòng không để trống!',
							whitespace: true,
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name='email'
					label='Tên đăng nhập'
					rules={[
						{
							required: true,
							message: 'Vui lòng không để trống!',
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
					<Input />
				</Form.Item>

				<Form.Item
					name='password'
					label='Mật khẩu'
					rules={[
						{
							required: true,
							message: 'Vui lòng không để trống!',
						},
						{
							min: 6,
							max: 20,
							message: 'Vui lòng nhập từ 6 đến 20 kí tự!',
						},
					]}
					hasFeedback
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					name='confirm'
					label='Xác nhận mật khẩu'
					dependencies={['password']}
					hasFeedback
					rules={[
						{
							required: true,
							message: 'Không được bỏ trống mật khẩu!',
						},
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value) {
									return Promise.resolve()
								}

								return Promise.reject(new Error('Nhập sai mật khẩu!'))
							},
						}),
					]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item name='avatar' label='Ảnh đại diện'>
					<Upload
						name='avatar'
						listType='picture-card'
						className='avatar-uploader'
						showUploadList={false}
						action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
						beforeUpload={beforeUpload}
						onChange={handleChange}
						progress={{
							strokeColor: {
								'0%': '#108ee9',
								'100%': '#87d068',
							},
							strokeWidth: 3,
							format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
						}}
					>
						{upload.imageUrl ? (
							<img
								src={upload.imageUrl}
								alt='avatar'
								style={{ width: '100%' }}
							/>
						) : (
							uploadButton
						)}
					</Upload>
				</Form.Item>

				<Form.Item {...tailFormItemLayout}>
					<Button
						style={{ backgroundColor: 'green' }}
						type='primary'
						htmlType='submit'
						loading={isLoading}
					>
						Đăng kí
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}
