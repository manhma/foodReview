import {
	EnvironmentOutlined,
	MoreOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons'
import { Avatar, Carousel, Dropdown, Menu, message, Typography } from 'antd'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../../Context/AuthProvider'
import { ListUserContext } from '../../../../Context/ListUserProvider'
import { db } from '../../../../firebase/config'
import { IS_ACTIVE, ROLE } from '../../../../utils/constants'
import FbImageLibrary from 'react-fb-image-grid'
import './rightBar.css'

const { Paragraph } = Typography

export default function RightBar() {
	const listUser = useContext(ListUserContext)
	const auth = useContext(AuthContext)

	const [listAds, setListAds] = useState([])
	const [postAds, setPostAds] = useState([])

	const getListAds = async () => {
		try {
			await db
				.collection('linkAdsYoutube')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setListAds(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}

	const getPostAds = async () => {
		try {
			await db
				.collection('postAds')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => {
						return {
							data: { ...doc.data() },
							id: doc.id,
						}
					})
					setPostAds(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		getListAds()
		getPostAds()
	}, [])

	return (
		<div className='rightBar'>
			<div className='bannerQc'>
				{listAds.length > 0 &&
					listAds.map((item, index) => (
						<iframe
							key={index}
							width='100%'
							src={item.data.link}
							title='YouTube video player'
							frameborder='0'
							allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
							allowfullscreen
						></iframe>
					))}

				<div
					style={{ alignItems: 'center', fontSize: '18px', fontWeight: 500 }}
				>
					<UnorderedListOutlined />
					<span style={{ marginLeft: '10px' }}>
						Bài viết tiêu điểm của quản trị
					</span>
				</div>
				{postAds.length > 0 &&
					postAds.map((item, index) => {
						if (item.data.isActive === IS_ACTIVE.ACTIVE) {
							const author = listUser.filter(
								(user) => user.id === item?.data?.userId
							)
							return (
								<div className='post' key={index}>
									<div className='postWrapper'>
										<div className='postTop'>
											<div className='postTopLeft'>
												{author[0]?.data?.avatar ? (
													<img
														className='postProfileImg'
														src={author[0]?.data?.avatar}
														alt=''
													/>
												) : (
													<Avatar src={author[0]?.data?.avatar}>
														{author[0]?.data?.avatar
															? ''
															: author[0]?.data?.displayName
																	?.charAt(0)
																	?.toUpperCase()}
													</Avatar>
												)}
												<span className='postUsername'>
													{author[0]?.data?.displayName}
												</span>
												<span className='postDate'>
													{moment(
														item?.data?.timeCreate?.seconds * 1000
													).format('HH:mm DD/MM/YYYY')}
												</span>
											</div>
											{auth?.data?.role === ROLE.ADMIN && (
												<div
													className='postTopRight'
													style={{ paddingRight: '12px' }}
												>
													<Dropdown
														overlay={
															<Menu>
																<Menu.Item
																	key='delete-post'
																	onClick={() => {
																		try {
																			if (
																				item.data.isActive === IS_ACTIVE.ACTIVE
																			) {
																				db.collection('postAds')
																					.doc(item.id)
																					.update({
																						isActive: IS_ACTIVE.INACTIVE,
																					})
																				message.success(
																					'Bạn ẩn bài viết thông báo trên hệ thống!'
																				)
																			}
																		} catch (error) {
																			console.log(error)
																		}
																	}}
																>
																	{item.data.isActive === IS_ACTIVE.ACTIVE &&
																		'Ẩn bài viết'}
																</Menu.Item>
															</Menu>
														}
														placement='bottomRight'
														trigger={['click']}
														arrow
													>
														<MoreOutlined style={{ fontSize: '18px' }} />
													</Dropdown>
												</div>
											)}
										</div>

										<div className='postCenter'>
											<div style={{ whiteSpace: 'pre-wrap' }}>
												<Paragraph
													ellipsis={
														true
															? {
																	rows: 5,
																	expandable: true,
																	symbol: '[Xem thêm ...]',
															  }
															: false
													}
												>
													{item?.data?.content}
												</Paragraph>
											</div>
											<div>
												{item?.data?.location.city && (
													<span style={{ marginLeft: '20px', color: 'green' }}>
														<EnvironmentOutlined />
														{item.data.location.ward}--
														{item.data.location.district}--
														{item.data.location.city}
													</span>
												)}
											</div>
											<div
												style={{ display: 'flex', justifyContent: 'center' }}
											>
												<div style={{ width: '55%' }}>
													<FbImageLibrary
														hideOverlay={true}
														images={item?.data?.media}
														countFrom={5}
														renderOverlay={() => 'Xem ảnh'}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							)
						}
					})}
			</div>
		</div>
	)
}
