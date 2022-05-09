import {
	EnvironmentOutlined,
	FileImageFilled,
	PlusOutlined,
} from '@ant-design/icons'
import {
	Avatar,
	Col,
	Divider,
	Form,
	Input,
	PageHeader,
	Row,
	Select,
	Button,
	Upload,
	message,
} from 'antd'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { AuthContext } from '../../../../Context/AuthProvider'
import { db } from '../../../../firebase/config'
import { addDocument } from '../../../../firebase/services'
import {
	IS_ACTIVE,
	STATUS_POST,
	NOTIFICATION_TYPE,
} from '../../../../utils/constants'
import firebase from '../../../../firebase/config'
import './post.css'

const { Option } = Select
const { TextArea } = Input

export default function EditPost() {
	const history = useHistory()
	const param = useLocation()
	const infoUser = useContext(AuthContext)
	const [postDetail, setPostDetail] = useState({})

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

	useEffect(() => {
		try {
			db.collection('posts')
				.doc(param.state)
				.onSnapshot((doc) => {
					const document = {
						data: doc.data(),
						id: doc.id,
					}
					const newFileList = document?.data?.media?.map((item) => ({
						type: 'image/png',
						thumbUrl: item,
					}))
					setFileList(newFileList)
					setPostDetail(document)
				})
		} catch (error) {
			console.log(error)
		}
	}, [param])

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
		setFileList(newFileList)
	}

	const onFinish = async (values) => {
		setIsLoading(true)
		try {
			const media = fileList.map((item) => item.thumbUrl)
			// console.log('value form: ', values)
			// console.log('category name, id: ', values.category, values.category[1])
			// console.log('chi tiết firebase: ', postDetail.data)

			if (values.category === postDetail.data.category) {
				if (location.city !== '') {
					db.collection('posts').doc(postDetail.id).update({
						content: values.content,
						media: media,
						location: location,
					})
				} else {
					db.collection('posts')
						.doc(postDetail.id)
						.update({ content: values.content, media: media })
				}
				history.goBack()
				message.success('Sửa bài thành công!')
			} else {
				if (location.city !== '') {
					db.collection('posts').doc(postDetail.id).update({
						content: values.content,
						media: media,
						location: location,
						category: values.category[0],
					})
				} else {
					db.collection('posts').doc(postDetail.id).update({
						content: values.content,
						media: media,
						category: values.category[0],
					})
				}
				//xoá category cũ
				db.collection('categorys')
					.where('name', 'in', [postDetail.data.category])
					.onSnapshot((snapshot) => {
						const document = snapshot.docs.map((doc) => ({
							data: { ...doc.data() },
							id: doc.id,
						}))
						const newCategory = document[0]?.data?.postId.filter(
							(id) => id !== postDetail.id
						)
						console.log(document)
						console.log(newCategory)
						db.collection('categorys').doc(document[0]?.id).update({
							postId: newCategory,
						})
					})
				// //thêm category mới
				await db
					.collection('categorys')
					.doc(values.category[1])
					.update({
						postId: firebase.firestore.FieldValue.arrayUnion(postDetail.id),
					})
				history.goBack()
				message.success('Sửa bài thành công!')
			}
			if (postDetail.data.status === STATUS_POST.NOT_CONFIRMED) {
				db.collection('posts').doc(postDetail.id).update({
					status: STATUS_POST.PENDING,
					note: '',
					timeCreate: firebase.firestore.FieldValue.serverTimestamp(),
				})
				addDocument('notifications', {
					fromUserId: infoUser.id,
					fromUserName: infoUser.data.displayName,
					toUserId: 'admin',
					postId: postDetail.id,
					isRead: 0,
					type: NOTIFICATION_TYPE.REUP_POST,
				})
			}
		} catch (error) {
			console.log(error)
			message.warn('Có lỗi khi sửa bài!')
		} finally {
			setIsLoading(false)
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
	}, [])

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
		<div>
			{postDetail.data && (
				<>
					<Row>
						<Col span={18} offset={4}>
							<PageHeader
								className='site-page-header'
								onBack={() => history.goBack()}
								title='Sửa bài đăng'
								style={{
									width: '100%',
									borderRadius: '10px',
									boxShadow: '0px 0px 16px -8px rgba(0, 0, 0, 0.68)',
								}}
							/>
						</Col>
					</Row>
					<Row>
						<Col span={12} offset={6}>
							<div className='inModal'>
								<div className='inModalTop'>
									<Avatar src={infoUser.data.avatar}>
										{infoUser.data.avatar
											? ''
											: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
									</Avatar>
									<span className='nameInModal'>
										{infoUser.data.displayName}
									</span>
								</div>
								<Form
									layout='vertical'
									form={form}
									initialValues={postDetail.data}
									onFinish={onFinish}
									style={{ marginTop: '10px' }}
								>
									<Form.Item name='category'>
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

									<Form.Item
										className='inModalCenter'
										name='content'
										rules={[
											{
												required: true,
												message: 'Không được bỏ trống!',
											},
										]}
										style={{ marginTop: '20px' }}
									>
										<TextArea
											bordered={false}
											placeholder='Bạn đang muốn review gì thế?'
											autoSize={{ minRows: 3, maxRows: 5 }}
										/>
									</Form.Item>
									<Divider style={{ width: '100%' }} />
									<div className='inModalUpload'>
										<span>Thêm ảnh </span>
										<Upload
											action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
											listType='picture-card'
											fileList={fileList}
											onChange={onChange}
											progress={{
												strokeColor: {
													'0%': '#108ee9',
													'100%': '#87d068',
												},
												strokeWidth: 3,
												format: (percent) =>
													`${parseFloat(percent.toFixed(2))}%`,
											}}
										>
											{fileList.length < 10 && '+ Upload'}
										</Upload>
									</div>
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
													defaultValue={postDetail.data.location.city}
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
													defaultValue={postDetail.data.location.district}
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
													defaultValue={postDetail.data.location.ward}
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
									{/* <div className='inModalBottom'>
										<div className='inModalBotLeft'>
											<span style={{ fontWeight: 'bold' }}>
												Thêm vào bài viết
											</span>
										</div>
										<div className='inModalbotRight'>
											<FileImageFilled
												onClick={() => {
													// setIsUpImage(!isUpImage)
												}}
												style={{ color: 'orangered' }}
												className='inModalIcon'
											/>

											<EnvironmentOutlined
												style={{ color: 'green' }}
												onClick={() => {
													// setShowLocation(!showLocation)
												}}
												className='inModalIcon'
											/>
										</div>
									</div> */}
									<Form.Item>
										<Button
											htmlType='submit'
											className='btnInModal'
											loading={isLoading}
										>
											Lưu sửa
										</Button>
									</Form.Item>
								</Form>
							</div>
						</Col>
					</Row>
				</>
			)}
		</div>
	)
}
