import {
	BellOutlined,
	FileExclamationOutlined,
	FormOutlined,
	HeartOutlined,
	LogoutOutlined,
	SearchOutlined,
	SettingFilled,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons'
import {
	Affix,
	Badge,
	Button,
	Col,
	Dropdown,
	Empty,
	Form,
	Menu,
	message,
	Row,
} from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import logo from '../../assets/images/logo.jpg'
import { AuthContext } from '../../Context/AuthProvider'
import { NotificationContext } from '../../Context/NotificationProvider'
import { auth, db } from '../../firebase/config'
import { NOTIFICATION_TYPE, ROLE } from '../../utils/constants'
import './header.css'

export default function Header(props) {
	const history = useHistory()
	const infoUser = useContext(AuthContext)
	const notifi = useContext(NotificationContext)
	const [notification, setNotification] = useState([])
	const [countNotification, setCountNotification] = useState(0)

	//post detail
	const [dataPost, setDataPost] = useState()

	useEffect(() => {
		let list = []
		let count = 0
		notifi.forEach((item) => {
			if (
				(item.data.toUserId === infoUser.id &&
					item.data.toUserId !== item.data.fromUserId) ||
				(infoUser.data.role === 1 && item.data.toUserId === 'admin') ||
				(infoUser.data.role === 2 && item.data.toUserId === 'admin')
			) {
				list.push(item)
				if (item.data.isRead === 0) {
					count += 1
				}
				setCountNotification(count)
			}
		})
		setNotification(list)
	}, [notifi])

	const settingMenu = (
		<Menu>
			{infoUser.data.role === 1 || infoUser.data.role === 2 ? (
				<Menu.Item
					key='0'
					onClick={() => {
						history.push('/post-approval')
					}}
				>
					<FileExclamationOutlined style={{ margin: '5px' }} />
					Quyền quản trị
				</Menu.Item>
			) : (
				<></>
			)}
			<Menu.Item
				key='1'
				onClick={() => message.warn('Hệ thống đang nâng cấp tính năng này!')}
			>
				<SettingOutlined style={{ margin: '5px' }} />
				Cài đặt khác
			</Menu.Item>
			<Menu.Item
				key='3'
				onClick={() => {
					auth.signOut()
					history.push('/login')
				}}
			>
				<LogoutOutlined style={{ margin: '5px' }} />
				Đăng xuất
			</Menu.Item>
		</Menu>
	)

	const handleSelectNotification = async (event) => {
		// console.log('handle notification like', event)
		const array = event.key.split(',')
		// console.log('id notifi - array[0]: ', array[0])
		// console.log('id post - array[1]: ', array[1])
		if (array.length === 2) {
			try {
				await db.collection('notifications').doc(array[0]).update({ isRead: 1 })
			} catch (error) {
				console.log(error)
			} finally {
				try {
					await db
						.collection('posts')
						.doc(array[1])
						.onSnapshot((doc) => {
							const document = {
								data: doc.data(),
								id: doc.id,
							}
							setDataPost(document)
						})
				} catch (error) {
					console.log(error)
				} finally {
				}
			}
		} else {
			try {
				await db.collection('notifications').doc(array[0]).update({ isRead: 1 })
				history.push('/post-approval')
			} catch (error) {
				console.log(error)
			}
		}
	}

	useEffect(() => {
		if (dataPost) {
			history.push({
				pathname: `/post-detail/${dataPost.id}`,
				state: dataPost.id,
			})
		}
	}, [dataPost])

	const notificationMenu = (
		<Menu onClick={handleSelectNotification}>
			<Menu.ItemGroup
				title='Thông báo'
				style={{ overflowY: 'scroll', height: '300px' }}
			>
				{notification.length === 0 ? (
					<Empty description='Không có thông báo!' />
				) : (
					notification.map((item, index) => {
						switch (item.data.type) {
							case NOTIFICATION_TYPE.LIKE:
								return (
									<Menu.Item key={[item.id, item.data.postId]}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<div style={{ alignSelf: 'center' }}>
												<HeartOutlined style={{ margin: '5px' }} />
											</div>
											<div style={{ flex: 1 }}>
												<div>
													{item.data.fromUserName} đã yêu thích bài viết của bạn
												</div>
												<div>
													{moment(item.data.timeCreate?.seconds * 1000).format(
														'HH:mm DD/MM/YYYY'
													)}
												</div>
											</div>
											{item.data.isRead === 0 && (
												<div style={{ alignSelf: 'center' }}>
													<Badge dot />
												</div>
											)}
										</div>
									</Menu.Item>
								)
							case NOTIFICATION_TYPE.COMMENT:
								return (
									<Menu.Item key={[item.id, item.data.postId]}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<div style={{ alignSelf: 'center' }}>
												<FormOutlined style={{ margin: '5px' }} />
											</div>
											<div style={{ flex: 1 }}>
												<div>
													{item.data.fromUserName} đã bình luận bài viết của bạn
												</div>
												<div>
													{moment(item.data.timeCreate?.seconds * 1000).format(
														'HH:mm DD/MM/YYYY'
													)}
												</div>
											</div>
											{item.data.isRead === 0 ? (
												<div style={{ alignSelf: 'center' }}>
													<Badge dot />
												</div>
											) : (
												<></>
											)}
										</div>
									</Menu.Item>
								)
							case NOTIFICATION_TYPE.ACCEPT_POST:
								return (
									<Menu.Item key={[item.id, item.data.postId]}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<div style={{ alignSelf: 'center' }}>
												<BellOutlined style={{ margin: '5px' }} />
											</div>
											<div style={{ flex: 1 }}>
												<div>
													{item.data.fromUserName} đã duyệt bài viết của bạn
												</div>
												<div>
													{moment(item.data.timeCreate?.seconds * 1000).format(
														'HH:mm DD/MM/YYYY'
													)}
												</div>
											</div>
											{item.data.isRead === 0 ? (
												<div style={{ alignSelf: 'center' }}>
													<Badge dot />
												</div>
											) : (
												<></>
											)}
										</div>
									</Menu.Item>
								)
							case NOTIFICATION_TYPE.CANCEL_POST:
								return (
									<Menu.Item key={[item.id, item.data.postId]}>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<div style={{ alignSelf: 'center' }}>
												<BellOutlined style={{ margin: '5px' }} />
											</div>
											<div>
												<div>
													{item.data.fromUserName} từ chối bài viết của bạn vì
													một lí do nào đó
												</div>
												<div>
													{moment(item.data.timeCreate?.seconds * 1000).format(
														'HH:mm DD/MM/YYYY'
													)}
												</div>
											</div>
											{item.data.isRead === 0 ? (
												<div style={{ alignSelf: 'center' }}>
													<Badge dot />
												</div>
											) : (
												<></>
											)}
										</div>
									</Menu.Item>
								)

							case NOTIFICATION_TYPE.NEW_POST:
								if (
									infoUser.data.role === ROLE.ADMIN ||
									infoUser.data.role === ROLE.MOD
								) {
									return (
										<Menu.Item key={[item.id]}>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<div style={{ alignSelf: 'center' }}>
													<BellOutlined style={{ margin: '5px' }} />
												</div>
												<div style={{ flex: 1 }}>
													<div>Có bài viết mới cần duyệt</div>
													<div>
														{moment(
															item.data.timeCreate?.seconds * 1000
														).format('HH:mm DD/MM/YYYY')}
													</div>
												</div>
												{item.data.isRead === 0 ? (
													<div style={{ alignSelf: 'center' }}>
														<Badge dot />
													</div>
												) : (
													<></>
												)}
											</div>
										</Menu.Item>
									)
								} else {
									return
								}

							case NOTIFICATION_TYPE.REUP_POST:
								if (
									infoUser.data.role === ROLE.ADMIN ||
									infoUser.data.role === ROLE.MOD
								) {
									return (
										<Menu.Item key={[item.id]}>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<div style={{ alignSelf: 'center' }}>
													<BellOutlined style={{ margin: '5px' }} />
												</div>
												<div style={{ flex: 1 }}>
													<div>Có bài viết yêu cầu duyệt lại</div>
													<div>
														{moment(
															item.data.timeCreate?.seconds * 1000
														).format('HH:mm DD/MM/YYYY')}
													</div>
												</div>
												{item.data.isRead === 0 ? (
													<div style={{ alignSelf: 'center' }}>
														<Badge dot />
													</div>
												) : (
													<></>
												)}
											</div>
										</Menu.Item>
									)
								} else {
									return
								}

							default:
								return
						}
					})
				)}
			</Menu.ItemGroup>
		</Menu>
	)

	return (
		<Affix offsetTop={0}>
			<Row
				style={{
					backgroundColor: 'white',
					width: '100%',
					height: '65px',
					boxShadow: '0px 6px 10px -9px rgba(0, 0, 0, 0.75)',
				}}
			>
				<Col
					md={{ span: 18, offset: 3 }}
					xs={{ span: 24 }}
					style={{ height: '65px' }}
				>
					<Row
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<Col>
							<img
								style={{ height: '65px', width: 'auto', cursor: 'pointer' }}
								src={logo}
								alt='logo'
								onClick={() => {
									history.push('/')
								}}
							/>
						</Col>

						<Col
							style={{
								display: 'flex',
								alignItems: 'center',
								width: '300px',
								height: '32px',
								backgroundColor: '#f0f2f5',
								borderRadius: '20px',
								marginLeft: '15px',
							}}
						>
							<SearchOutlined style={{ marginLeft: '10px' }} />
							<Form
								onFinish={(value) =>
									history.push({
										pathname: `/search/${value.key_search}`,
										state: {
											key: value.key_search,
											type: 'search',
										},
									})
								}
							>
								<Form.Item name='key_search'>
									<input
										className='header_search'
										placeholder='Tìm kiếm các thứ !!'
										style={{
											marginRight: '5px',
											border: 'none',
											backgroundColor: '#f0f2f5',
											outline: 'none',
											width: '270px',
											marginTop: '11px',
										}}
									/>
								</Form.Item>
							</Form>
						</Col>
						<Col
							style={{
								position: 'absolute',
								right: '20px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Button
								style={{
									marginRight: '15px',
									fontWeight: 'bold',
									backgroundColor: 'tomato',
									color: 'white',
								}}
								type='text'
								onClick={() =>
									message.warn('Hệ thống đang nâng cấp tính năng này!')
								}
							>
								Tải app
							</Button>

							{infoUser.id ? (
								<>
									<Dropdown
										overlay={notificationMenu}
										trigger={['click']}
										placement='bottomRight'
										arrow
									>
										<Badge size='small' count={countNotification}>
											<Avatar
												style={{ backgroundColor: 'tomato', cursor: 'pointer' }}
												icon={<BellOutlined />}
											/>
										</Badge>
									</Dropdown>
									<Avatar
										style={{
											marginRight: '15px',
											marginLeft: '15px',
											cursor: 'pointer',
										}}
										size={40}
										src={infoUser.data?.avatar}
										icon={infoUser.id === '' ? <UserOutlined /> : ''}
										onClick={() => history.push('/profile')}
									>
										{infoUser.data.avatar
											? ''
											: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
									</Avatar>
									<Dropdown
										overlay={settingMenu}
										trigger={['click']}
										placement='bottomRight'
										arrow
									>
										<Avatar
											style={{ color: 'black', cursor: 'pointer' }}
											icon={<SettingFilled />}
										/>
									</Dropdown>
								</>
							) : (
								<Button
									style={{
										marginRight: '15px',
										fontWeight: 'bold',
										backgroundColor: 'tomato',
										color: 'white',
									}}
									type='text'
									onClick={() => history.push('/login')}
								>
									Đăng nhập
								</Button>
							)}
						</Col>
					</Row>
				</Col>
			</Row>
		</Affix>
	)
}
