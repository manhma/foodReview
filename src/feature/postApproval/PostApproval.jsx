import {
	LoadingOutlined,
	PlusOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons'
import {
	Button,
	Col,
	DatePicker,
	Form,
	Input,
	message,
	Modal,
	Row,
	Typography,
	Upload,
} from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import moment from 'moment'
import 'moment/locale/vi'
import React, { useContext, useEffect, useState } from 'react'
//Quay số
import WheelComponent from 'react-wheel-of-prizes'
import 'react-wheel-of-prizes/dist/index.css'
import Header from '../../common/header/Header'
import { ListPostContext } from '../../Context/ListPostProvider'
import { ListUserContext } from '../../Context/ListUserProvider'
import firebase, { db } from '../../firebase/config'
import { addDocument } from '../../firebase/services'
import { IS_ACTIVE, ROLE } from '../../utils/constants'
import './PostApproval.css'
import User from './User'
import WaitingPost from './WaitingPost'

import logo from '../../assets/images/logo.jpg'
import { formatPrice } from '../../utils/funcHelp'
import { AuthContext } from '../../Context/AuthProvider'

const { RangePicker } = DatePicker
const { Text } = Typography

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

const defaultColor = [
	'#EE4040',
	'#F0CF50',
	'#815CD1',
	'#3DA5E0',
	'#34A24F',
	'#F9AA1F',
	'#EC3F3F',
	'#FF9000',
	'#EE4040',
	'#F0CF50',
	'#815CD1',
	'#3DA5E0',
	'#34A24F',
	'#F9AA1F',
	'#EC3F3F',
	'#FF9000',
	'#EE4040',
	'#F0CF50',
	'#815CD1',
	'#3DA5E0',
	'#34A24F',
	'#F9AA1F',
	'#EC3F3F',
	'#FF9000',
]

export default function PostApproval() {
	const [form] = Form.useForm()
	const infoUser = useContext(AuthContext)
	const listPost = useContext(ListPostContext)
	const listUser = useContext(ListUserContext)

	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isShowGift, setIsShowGift] = useState(false)
	const [listVoucher, setListVoucher] = useState([])
	const [segColors, setSegColors] = useState([])
	const [segments, setSegments] = useState([])
	const [userWin, setUserWin] = useState('')
	const [voucherSelected, setVoucherSelected] = useState(undefined)

	let listUserActive = listUser.filter(
		(item) => item.data.isActive === IS_ACTIVE.ACTIVE
	)

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

	const getListVoucher = () => {
		try {
			db.collection('vouchers')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setListVoucher(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		getListVoucher()
	}, [])

	const createVoucher = (values) => {
		const data = {
			name: values.voucherName,
			code: values.code,
			discount: values.discount,
			moneyMax: values.moneyMax,
			fromDate: moment(values.date[0]).format('DD-MM-YYYY'),
			toDate: moment(values.date[1]).format('DD-MM-YYYY'),
			logo: image,
			userIdWinner: '',
			isActive: IS_ACTIVE.ACTIVE,
		}
		try {
			setIsLoading(true)
			addDocument('vouchers', data)
		} catch (error) {
		} finally {
			setIsLoading(false)
			setIsModalVisible(false)
			setUpload({
				loading: false,
				imageUrl: '',
			})
			setImage('')
			form.resetFields()
		}
	}

	const handleWinner = () => {
		if (userWin) {
			const data = userWin.split('-')
			try {
				db.collection('vouchers').doc(voucherSelected).update({
					userIdWinner: listUserActive[data[1]].id,
				})
				db.collection('users')
					.doc(listUserActive[data[1]].id)
					.update({
						vouchers: firebase.firestore.FieldValue.arrayUnion(voucherSelected),
					})
			} catch (error) {
				console.log(error)
			} finally {
				setIsShowGift(false)
				setVoucherSelected(undefined)
			}
		} else {
			message.warn('Chưa hên xui mà!!!')
		}
	}

	return (
		<div>
			<Header />
			<Row>
				<Col span={6} className='categoryWrapper'>
					<div className='categoryTop'>
						<UnorderedListOutlined />
						<span
							style={{
								fontSize: '18px',
								fontWeight: '500',
								marginLeft: '10px',
							}}
						>
							Danh sách mã giảm giá
						</span>
						<Button
							style={{
								marginLeft: '100px',
								fontWeight: 'bold',
								backgroundColor: 'tomato',
								color: 'white',
							}}
							onClick={() => {
								if (infoUser.data.role === ROLE.ADMIN) {
									setIsModalVisible(true)
								} else {
									message.warn('Bạn cần là quản trị viên của hệ thống!')
								}
							}}
						>
							Thêm mới
						</Button>
					</div>

					<div>
						{listVoucher.map((item, index) => (
							<div
								className='voucher-ui postApprovalTop'
								style={{
									display: 'flex',
									height: '100px',
									border: '1px solid #dfcfcf',
									padding: '15px',
									boxSizing: 'content-box',
									borderRadius: '6px',
									marginBottom: '10px',
								}}
								key={index}
								onClick={() => {
									console.log(item)
									if (!item.data.userIdWinner) {
										const arr = []
										for (
											let index = 0;
											index < listUserActive.length;
											index++
										) {
											const index = Math.random() * listUserActive.length
											arr.push(defaultColor[Math.round(index)])
										}
										setSegments(
											listUserActive.map((item, index) => {
												return `${item.data.displayName}-${index}`
											})
										)
										setSegColors(arr)
										setVoucherSelected(item.id)
										setIsShowGift(true)
									} else {
										message.warn('Hên xui rồi còn đâu mà đòi làm lại lần nữa!')
									}
								}}
							>
								<div
									style={{
										width: '150px',
										height: '100%',
									}}
								>
									<img
										src={item.data.logo ? item.data.logo : logo}
										alt='Ảnh voucher'
										style={{
											display: 'block',
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								</div>
								<div className='highlightRight'>
									<div style={{ fontWeight: '700', fontSize: '20px' }}>
										<Text
											style={{ width: 250 }}
											ellipsis={{ tooltip: item.data.name }}
										>
											{item.data.name}
										</Text>
									</div>
									<div style={{ fontSize: '16px' }}>{`Giảm ${
										item.data.discount
									}% tối đa ${formatPrice(item.data.moneyMax)} đ`}</div>
									<div
										style={{ fontSize: '16px' }}
									>{`HSD: ${item.data.fromDate} -- ${item.data.toDate}`}</div>
									<div style={{ fontSize: '16px' }}>
										Người sở hữu:{' '}
										{item.data.userIdWinner
											? listUserActive.find(
													(user) => user.id === item.data.userIdWinner
											  ).data.displayName
											: '--'}
									</div>
								</div>
							</div>
						))}
					</div>
				</Col>
				<Col span={12} className='postApproval'>
					<div className='postApprovalTop'>
						<h2>Những bài viết cần phê duyệt</h2>
					</div>
					<div className='listPostApproval'>
						{listPost.map((item, index) => {
							if (item.data.status === 0) {
								return <WaitingPost data={item.data} id={item.id} key={index} />
							}
						})}
					</div>
				</Col>
				<Col span={6} className='categoryWrapper'>
					<div className='categoryTop'>
						<UnorderedListOutlined />
						<span
							style={{
								fontSize: '18px',
								fontWeight: '500',
								marginLeft: '10px',
							}}
						>
							Danh sách người dùng
						</span>
					</div>

					<div className='categoryBody'>
						{/* <input className='searchUser' placeholder='Tìm kiếm người dùng' /> */}
						<div className='listUser'>
							{listUserActive.map((item, index) => (
								<User key={index} data={item.data} id={item.id} />
							))}
						</div>
					</div>
				</Col>
			</Row>

			{/* Modal thêm mã giảm giá */}
			<Modal
				title='Tạo mã giảm giá'
				visible={isModalVisible}
				onCancel={() => {
					setIsModalVisible(false)
					setUpload({
						loading: false,
						imageUrl: '',
					})
					setImage('')
					form.resetFields()
				}}
				maskClosable={false}
				footer={null}
			>
				<Form
					{...formItemLayout}
					form={form}
					name='create-voucher'
					onFinish={createVoucher}
					scrollToFirstError
					labelAlign='left'
				>
					<Form.Item
						name='voucherName'
						label='Tên mã giảm giá'
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
						name='code'
						label='Code'
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
						name='discount'
						label='Giảm giá (%)'
						rules={[
							{
								required: true,
								message: 'Vui lòng nhập số % giảm giá!',
							},
							{
								message: 'Giá trị không hợp lệ!',
								validator: (_, value) => {
									const reg = /^([0-9]|[1-9][0-9]|100)$/
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
						name='moneyMax'
						label='Số tiền tối đa (VND)'
						rules={[
							{
								required: true,
								message: 'Vui lòng không để trống!',
							},
							{
								message: 'Giá không hợp lệ!',
								validator: (_, value) => {
									const reg = /^\d+$/
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
						name='date'
						label='Từ ngày - Đến ngày'
						rules={[
							{
								required: true,
								message: 'Vui lòng không để trống!',
							},
						]}
					>
						<RangePicker
							locale={locale}
							placeholder={['Từ ngày', 'Đến ngày']}
						/>
					</Form.Item>

					<Form.Item name='logo' label='Logo'>
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
							Tạo
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal quay số trúng thưởng */}
			<Modal
				className='modal-quay'
				title='Hên xui cùng vui!!!'
				visible={isShowGift}
				onOk={handleWinner}
				onCancel={() => setIsShowGift(false)}
				okText='Trao thưởng'
				cancelText='Huỷ'
				width={650}
			>
				<WheelComponent
					segments={segments}
					segColors={segColors}
					// winningSegment='ADMIN-1'
					onFinished={(winner) => setUserWin(winner)}
					primaryColor='black'
					contrastColor='white'
					buttonText='Quay'
					isOnlyOnce={false}
					size={290}
					upDuration={100}
					downDuration={1000}
				/>
			</Modal>
		</div>
	)
}
