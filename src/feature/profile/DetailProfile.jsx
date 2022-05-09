import {
	LineChartOutlined,
	LoadingOutlined,
	PlusOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Upload } from 'antd'
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Context/AuthProvider'
import { db, auth } from '../../firebase/config'

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

export default function DetailProfile(props) {
	const { data, countPost } = props
	const infoUser = useContext(AuthContext)
	const [form] = Form.useForm()
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [image, setImage] = useState('')

	const handleChangeImage = (info) => {
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

	const showModal = () => {
		setIsModalVisible(true)
	}

	const onFinish = async (values) => {
		setIsLoading(true)
		try {
			if (values.displayName) {
				await db
					.collection('users')
					.doc(infoUser.id)
					.update({ displayName: values.displayName })
			}
			if (values.password) {
				console.log(values.password)
				const response = auth.currentUser.updatePassword(values.password)
				console.log(response)
			}
			if (image) {
				await db.collection('users').doc(infoUser.id).update({ avatar: image })
			}
		} catch (error) {
			message.warn(error)
			console.log(error)
		} finally {
			form.resetFields()
			setImage('')
			setUpload({
				loading: false,
				imageUrl: '',
			})
			setIsModalVisible(false)
			setIsLoading(false)
			message.success('Thay đổi thông tin thành công!')
		}
	}

	const [upload, setUpload] = useState({
		loading: false,
		imageUrl: '',
	})

	const uploadButton = (
		<div>
			{upload.loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>Ảnh</div>
		</div>
	)

	return (
		<div className='profileDetail'>
			<div className='infoTop'>
				<h3 style={{ fontSize: '20px' }}>Thông tin cá nhân</h3>
			</div>
			<div className='infoCenter'>
				<div className='infos'>
					<UserOutlined className='infoIcon' />
					<div className='inforRight'>
						<span>Tên người dùng</span>
						<h3>{data.displayName}</h3>
					</div>
				</div>

				<div className='infos'>
					<LineChartOutlined className='infoIcon' />
					<div className='inforRight'>
						<span>Số bài đã đăng</span>
						<span>{countPost}</span>
					</div>
				</div>

				<div className='infos'>
					<LineChartOutlined className='infoIcon' />
					<div className='inforRight'>
						<span>Số bài đã lưu</span>
						<span>{data?.listPostSave?.length}</span>
					</div>
				</div>

				{/* <div
					className='info-voucher'
					style={{ cursor: 'pointer', display: 'flex' }}
				>
					<LineChartOutlined className='infoIcon' />
					<div className='inforRight'>
						<span>Số voucher hiện có</span>
						<span>{data.vouchers ? data?.vouchers?.length : 0}</span>
					</div>
				</div> */}

				<div className='btnEditInfo' onClick={showModal}>
					Chỉnh sửa thông tin cá nhân
				</div>

				<Modal
					title='Chỉnh sửa thông tin cá nhân'
					visible={isModalVisible}
					onCancel={() => {
						form.resetFields()
						setImage('')
						setUpload({
							loading: false,
							imageUrl: '',
						})
						setIsModalVisible(false)
					}}
					footer={null}
				>
					<Form
						form={form}
						labelCol={{ span: 7 }}
						wrapperCol={{ span: 17 }}
						onFinish={onFinish}
					>
						<Form.Item label='Tên người dùng mới' name='displayName'>
							<Input />
						</Form.Item>

						<Form.Item label='Mật khẩu mới' name='password'>
							<Input.Password />
						</Form.Item>

						<Form.Item label='Ảnh đại diện mới'>
							<Upload
								name='avatar'
								listType='picture-card'
								className='avatar-uploader'
								showUploadList={false}
								action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
								beforeUpload={beforeUpload}
								onChange={handleChangeImage}
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

						<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
							<Button type='primary' htmlType='submit' loading={isLoading}>
								Lưu thay đổi
							</Button>
						</Form.Item>
					</Form>
				</Modal>
			</div>
			<div className='infoBot'></div>
		</div>
	)
}
