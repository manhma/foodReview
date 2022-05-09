import {
	EllipsisOutlined,
	EnvironmentOutlined,
	FileImageFilled,
	PlusOutlined,
	SmileFilled,
	TagFilled,
} from '@ant-design/icons'
import {
	Avatar,
	Button,
	Col,
	Divider,
	Form,
	Input,
	message,
	Row,
	Select,
	Upload,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { db } from '../../../../firebase/config.js'
import { addDocument, updateDocument } from '../../../../firebase/services.js'
import {
	IS_ACTIVE,
	NOTIFICATION_TYPE,
	ROLE,
	STATUS_POST,
} from '../../../../utils/constants'
import firebase from '../../../../firebase/config'

const { Option } = Select

const axios = require('axios')

export default function Inmodal(props) {
	const {
		infoUser,
		isModalVisible,
		setIsModalVisible,
		isUpImage,
		setIsUpImage,
		showLocation,
		setShowLocation,
	} = props

	const [form] = Form.useForm()

	const [fileList, setFileList] = useState([])
	const [categoryList, setCategoryList] = useState([])
	const [cityList, setCityList] = useState([])
	const [district, setDistrict] = useState([])
	const [ward, setWard] = useState([])
	const [location, setLocation] = useState({
		city: '',
		district: '',
		ward: '',
	})
	const [categoryName, setCategoryName] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const [typePost, setTypePost] = useState(1)

	useEffect(() => {
		try {
			db.collection('categorys')
				.orderBy('isActive')
				.where('isActive', '>=', 1)
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setCategoryList(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}, [])

	const onChange = ({ fileList: newFileList, file, event }) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
		if (!isJpgOrPng) {
			message.error('Vui lòng nhập định dạng JPG/PNG!')
			return
		}
		console.log('ảnh: ', newFileList)
		setFileList(newFileList)
	}

	const onPreview = async (file) => {
		let src = file.url
		if (!src) {
			src = await new Promise((resolve) => {
				const reader = new FileReader()
				reader.readAsDataURL(file.originFileObj)
				reader.onload = () => resolve(reader.result)
			})
		}
		const image = new Image()
		image.src = src
		const imgWindow = window.open(src)
		imgWindow.document.write(image.outerHTML)
	}

	const onFinish = async (values) => {
		let postID = ''
		if (typePost === 1) {
			setIsLoading(true)
			try {
				const media = fileList.map((item) => item.thumbUrl)
				let statusPost
				if (infoUser.data.role === ROLE.USER) {
					statusPost = STATUS_POST.PENDING
				} else {
					statusPost = STATUS_POST.CONFIRMED
				}
				if (values.category) {
					const response = await addDocument('posts', {
						userId: infoUser.id,
						content: values.text,
						category: values.category[0],
						location: location,
						media: media,
						status: statusPost,
						isActive: IS_ACTIVE.ACTIVE,
						reaction: [],
					})
					postID = response.id
					await db
						.collection('categorys')
						.doc(values.category[1])
						.update({
							postId: firebase.firestore.FieldValue.arrayUnion(response.id),
						})
				} else {
					const response = await addDocument('posts', {
						userId: infoUser.id,
						content: values.text,
						category: '',
						location: location,
						media: media,
						status: statusPost,
						isActive: IS_ACTIVE.ACTIVE,
						reaction: [],
					})
					postID = response.id
				}
				form.resetFields()
				setFileList([])
				setIsUpImage(!isUpImage)
				setIsModalVisible(false)
				setLocation({
					city: '',
					district: '',
					ward: '',
				})
			} catch (error) {
				console.log(error)
			} finally {
				setIsLoading(false)
				if (infoUser.data.role === ROLE.USER) {
					message.success('Bài của bạn cần đợi quản trị viên kiểm duyệt!')
					addDocument('notifications', {
						fromUserId: infoUser.id,
						fromUserName: infoUser.data.displayName,
						toUserId: 'admin',
						postId: postID,
						isRead: 0,
						type: NOTIFICATION_TYPE.NEW_POST,
					})
				}
			}
		} else {
			setIsLoading(true)
			try {
				const media = fileList.map((item) => item.thumbUrl)
				await addDocument('postAds', {
					userId: infoUser.id,
					content: values.text,
					location: location,
					media: media,
					isActive: IS_ACTIVE.ACTIVE,
				})

				form.resetFields()
				setFileList([])
				setIsUpImage(!isUpImage)
				setIsModalVisible(false)
				setLocation({
					city: '',
					district: '',
					ward: '',
				})
			} catch (error) {
				console.log(error)
			} finally {
				setIsLoading(false)
				message.success('Bài viết tiêu điểm đã được đăng!')
			}
		}
	}

	const handleAddLinkAds = async (value) => {
		setIsLoading(true)
		try {
			await addDocument('linkAdsYoutube', {
				link: value.link,
				isActive: IS_ACTIVE.ACTIVE,
			})

			form.resetFields()
			setIsModalVisible(false)
		} catch (error) {
			console.log(error)
		} finally {
			setIsLoading(false)
			message.success('Link quảng cáo đã được đăng!')
		}
	}
	const getCity = async () => {
		try {
			const response = await axios.get(
				'https://vapi.vnappmob.com/api/province/'
			)
			setCityList(response.data.results)
		} catch (error) {
			console.log(error)
		}
	}

	const getDistrict = async (cityId) => {
		try {
			const response = await axios.get(
				`https://vapi.vnappmob.com/api/province/district/${cityId}`
			)
			setDistrict(response.data.results)
		} catch (error) {
			console.log(error)
		}
	}

	const getWard = async (districtId) => {
		try {
			const response = await axios.get(
				`https://vapi.vnappmob.com/api/province/ward/${districtId}`
			)
			setWard(response.data.results)
		} catch (error) {
			console.log(error)
		}
	}
	useEffect(() => {
		getCity()
	}, [isModalVisible])

	const onChangeCity = (value) => {
		getDistrict(value[1])
		setLocation({
			...location,
			city: value[0],
		})
	}

	const onChangeDistrict = (value) => {
		getWard(value[1])
		setLocation({ ...location, district: value[0] })
	}

	const onChangeWard = (value) => {
		setLocation({ ...location, ward: value[0] })
	}

	const onNameChange = (e) => {
		setCategoryName(e.target.value)
	}

	const addItem = async () => {
		if (categoryName) {
			try {
				await addDocument('categorys', {
					name: categoryName,
					isActive: IS_ACTIVE.ACTIVE,
					postId: [],
				})
				setCategoryName('')
			} catch (error) {
				console.log(error)
			}
		} else {
			message.warn('Không bỏ trống tên danh mục!')
		}
	}

	return (
		<div className='inModal'>
			<div className='inModalTop'>
				<Avatar src={infoUser.data.avatar}>
					{infoUser.data.avatar
						? ''
						: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
				</Avatar>
				<span className='nameInModal'>{infoUser.data.displayName}</span>
				{infoUser.data.role === 1 && (
					<Select
						style={{ marginLeft: '100px', flex: 1 }}
						defaultValue={typePost}
						onChange={(value) => setTypePost(value)}
					>
						<Option value={1}>Đăng bài</Option>
						<Option value={2}>Đăng bài tiêu điểm</Option>
						<Option value={3}>Gắn link quảng cáo youtube</Option>
					</Select>
				)}
			</div>

			{typePost !== 3 ? (
				<Form
					layout='vertical'
					form={form}
					onFinish={onFinish}
					style={{ marginTop: '10px' }}
				>
					{typePost === 1 && (
						<Form.Item
							name='category'
							rules={
								[
									// {
									// 	required: true,
									// 	message: 'Không được bỏ trống danh mục!',
									// },
								]
							}
						>
							<Select
								allowClear
								placeholder='Chọn danh mục bài đăng'
								showSearch
								optionFilterProp='children'
								dropdownRender={(menu) => (
									<div>
										{menu}
										<Divider style={{ margin: '4px 0' }} />
										<div
											style={{
												display: 'flex',
												flexWrap: 'nowrap',
												padding: 8,
											}}
										>
											<Input
												style={{ flex: 'auto' }}
												value={categoryName}
												onChange={onNameChange}
											/>
											<a
												style={{
													flex: 'none',
													padding: '8px',
													display: 'block',
													cursor: 'pointer',
												}}
												onClick={addItem}
											>
												<PlusOutlined /> Thêm danh mục
											</a>
										</div>
									</div>
								)}
							>
								{categoryList.map((item, index) => {
									const param = [item.data.name, item.id]
									return (
										<Option key={index} value={param}>
											{item.data.name}
										</Option>
									)
								})}
							</Select>
						</Form.Item>
					)}

					<Form.Item
						className='inModalCenter'
						name='text'
						rules={[
							{
								required: true,
								message: 'Không được bỏ trống!',
							},
						]}
						style={{ marginTop: '20px' }}
					>
						<Input.TextArea
							bordered={false}
							placeholder='Bạn đang muốn review gì thế?'
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					</Form.Item>

					{isUpImage ? (
						<>
							<Divider style={{ width: '100%' }} />
							<div className='inModalUpload'>
								<span>Thêm ảnh </span>
								<Upload
									action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
									listType='picture-card'
									fileList={fileList}
									onChange={onChange}
									onPreview={onPreview}
									progress={{
										strokeColor: {
											'0%': '#108ee9',
											'100%': '#87d068',
										},
										strokeWidth: 3,
										format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
									}}
								>
									{fileList.length < 10 && '+ Ảnh'}
								</Upload>
							</div>
						</>
					) : (
						<></>
					)}

					{showLocation && (
						<>
							<Divider style={{ width: '100%' }} />
							<Form.Item label='Địa điểm'>
								<Row gutter={[8, 8]}>
									<Col span={8}>
										<Select
											showSearch
											style={{ width: '100%' }}
											placeholder='Tỉnh/ Thành phố'
											optionFilterProp='children'
											onChange={onChangeCity}
										>
											{cityList.map((item, index) => {
												const param = [item.province_name, item.province_id]
												return (
													<Option key={index} value={param}>
														{item.province_name}
													</Option>
												)
											})}
										</Select>
									</Col>

									<Col span={8}>
										<Select
											showSearch
											style={{ width: '100%' }}
											placeholder='Quận/ Huyện'
											optionFilterProp='children'
											onChange={onChangeDistrict}
										>
											{district.map((item, index) => {
												const param = [item.district_name, item.district_id]
												return (
													<Option key={index} value={param}>
														{item.district_name}
													</Option>
												)
											})}
										</Select>
									</Col>

									<Col span={8}>
										<Select
											showSearch
											style={{ width: '100%' }}
											placeholder='Xã/ Phường'
											optionFilterProp='children'
											onChange={onChangeWard}
										>
											{ward.map((item, index) => {
												const param = [item.ward_name, item.ward_id]
												return (
													<Option key={index} value={param}>
														{item.ward_name}
													</Option>
												)
											})}
										</Select>
									</Col>
								</Row>
							</Form.Item>
						</>
					)}

					<div className='inModalBottom'>
						<div className='inModalBotLeft'>
							<span style={{ fontWeight: 'bold' }}>Thêm vào bài viết</span>
						</div>
						<div className='inModalbotRight'>
							<FileImageFilled
								onClick={() => {
									setIsUpImage(!isUpImage)
								}}
								style={{ color: 'orangered' }}
								className='inModalIcon'
							/>

							<EnvironmentOutlined
								style={{ color: 'green' }}
								onClick={() => {
									setShowLocation(!showLocation)
								}}
								className='inModalIcon'
							/>
						</div>
					</div>

					<Form.Item>
						<Button
							htmlType='submit'
							className='btnInModal'
							loading={isLoading}
						>
							Đăng bài
						</Button>
					</Form.Item>
				</Form>
			) : (
				<Form
					layout='vertical'
					form={form}
					onFinish={handleAddLinkAds}
					style={{ marginTop: '10px' }}
				>
					<Form.Item
						className='inModalCenter'
						name='link'
						rules={[
							{
								required: true,
								message: 'Không được bỏ trống!',
							},
						]}
						style={{ marginTop: '20px' }}
					>
						<Input
							bordered={false}
							placeholder='Nhập link của nhà quảng cáo ...'
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							htmlType='submit'
							className='btnInModal'
							loading={isLoading}
						>
							Đăng link quảng cáo
						</Button>
					</Form.Item>
				</Form>
			)}
		</div>
	)
}
