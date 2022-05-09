import {
	Button,
	Col,
	Divider,
	Modal,
	Row,
	Upload,
	message,
	Form,
	Input,
} from 'antd'
import React, { useState } from 'react'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

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

export default function Account() {
	const [isModalVisible1, setIsModalVisible1] = useState(false)
	const showModal1 = () => {
		setIsModalVisible1(true)
	}
	const handleOk1 = () => {
		setIsModalVisible1(false)
	}
	const handleCancel1 = () => {
		setIsModalVisible1(false)
	}
	const [isModalVisible2, setIsModalVisible2] = useState(false)
	const showModal2 = () => {
		setIsModalVisible2(true)
	}
	const handleOk2 = () => {
		setIsModalVisible2(false)
	}
	const handleCancel2 = () => {
		setIsModalVisible2(false)
	}
	const [isModalVisible3, setIsModalVisible3] = useState(false)
	const showModal3 = () => {
		setIsModalVisible3(true)
	}
	const handleOk3 = () => {
		setIsModalVisible3(false)
	}
	const handleCancel3 = () => {
		setIsModalVisible3(false)
	}

	//cai nay cho upload
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

	return (
		<Col span={16} offset={4} style={{ marginTop: '50px' }}>
			<Row>
				<Col>
					<h1>Tài khoản của bạn</h1>
				</Col>
			</Row>
			<Divider />
			<Row>
				<Col span={6} style={{ fontWeight: 'bold' }}>
					Tên người dùng
				</Col>
				<Col span={12}>
					<p>Mạnh</p>
				</Col>
				<Col span={6}>
					<Button onClick={showModal1}>Chỉnh sửa</Button>
					<Modal
						title='Tên người dùng'
						visible={isModalVisible1}
						onOk={handleOk1}
						onCancel={handleCancel1}
					>
						<input placeholder='Nhập tên mới của bạn' />
					</Modal>
				</Col>
			</Row>
			<Divider />
			<Row>
				<Col span={6} style={{ fontWeight: 'bold' }}>
					Ảnh đại diện
				</Col>
				<Col span={12}>
					<img
						style={{ width: '150px', height: 'auto' }}
						src='https://toigingiuvedep.vn/wp-content/uploads/2021/06/hinh-anh-gai-xinh-de-thuong-nhat-1-580x362.jpg'
					/>
				</Col>
				<Col span={6}>
					<Button onClick={showModal2}>Chỉnh sửa</Button>
					<Modal
						title='Ảnh đại diện'
						visible={isModalVisible2}
						onOk={handleOk2}
						onCancel={handleCancel2}
					>
						<p>Chọn ảnh đại diện mới </p>
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
					</Modal>
				</Col>
			</Row>
			<Divider />
			<Row>
				<Col span={6} style={{ fontWeight: 'bold' }}>
					Mật khẩu
				</Col>
				<Col span={12}></Col>
				<Col span={6}>
					<Button onClick={showModal3}>Chỉnh sửa</Button>
					<Modal
						title='Mật khẩu'
						visible={isModalVisible3}
						onOk={handleOk3}
						onCancel={handleCancel3}
					>
						<Form>
							<Form.Item
								name='password'
								label='Mật khẩu cũ'
								rules={[
									{
										required: true,
										message: 'Vui lòng không bỏ trống !',
									},
								]}
							>
								<Input.Password />
							</Form.Item>
							<Form.Item
								name='newpassword'
								label='Mật khẩu mới'
								rules={[
									{
										required: true,
										message: 'Vui lòng không bỏ trống !',
									},
								]}
								hasFeedback
							>
								<Input.Password />
							</Form.Item>

							<Form.Item
								name='confirm'
								label='Nhập lại mật khẩu mới'
								dependencies={['password']}
								hasFeedback
								rules={[
									{
										required: true,
										message: 'Vui lòng không để trống!',
									},
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue('password') === value) {
												return Promise.resolve()
											}
											return Promise.reject(
												new Error('Hai mật khẩu bạn đã nhập không khớp!')
											)
										},
									}),
								]}
							>
								<Input.Password />
							</Form.Item>
						</Form>
					</Modal>
				</Col>
			</Row>
		</Col>
	)
}
