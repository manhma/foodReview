import {
	EnvironmentOutlined,
	HeartOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons'
import { Avatar, Empty, Typography } from 'antd'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import FbImageLibrary from 'react-fb-image-grid'
import { useHistory } from 'react-router-dom'
import { ListPostContext } from '../../../../Context/ListPostProvider'
import { ListUserContext } from '../../../../Context/ListUserProvider'
import { db } from '../../../../firebase/config'
import { IS_ACTIVE } from '../../../../utils/constants'
import Highlight from './Highlight'
import './sidebar.css'

const { Paragraph } = Typography

export default function Sidebar() {
	const listPost = useContext(ListPostContext)
	const listUser = useContext(ListUserContext)
	const [categoryList, setCategoryList] = useState([])

	const history = useHistory()

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

	return (
		<div className='sidebar'>
			<div className='titleSidebar'>
				<UnorderedListOutlined />
				<span style={{ marginLeft: '10px' }}>Danh mục review</span>
			</div>
			<div className='listTag'>
				{categoryList.map((item, index) => {
					if (item.data?.postId?.length > 2) {
						return (
							<div
								key={index}
								style={{ width: '100%' }}
								onClick={() =>
									history.push({
										pathname: `/search/${item.data.name}`,
										state: {
											key: item.data.name,
											type: 'search_category',
										},
									})
								}
							>
								<Highlight key={index} id={item.id} data={item.data} />
							</div>
						)
					}
				})}
			</div>

			<div className='highlights'>
				<div className='highlightsTop'>
					<span style={{ fontSize: '18px', fontWeight: '500' }}>
						Những bài review nổi bật
					</span>
				</div>

				<div className='highlightsBody'>
					{listPost.map((item, index) => {
						if (
							item.data.status === 1 &&
							item.data.isActive === IS_ACTIVE.ACTIVE &&
							item.data.reaction.length >= 3
						) {
							const author = listUser.filter(
								(user) => user.id === item?.data?.userId
							)
							return (
								<div
									key={index}
									className='post'
									style={{ cursor: 'pointer' }}
									onClick={() => {
										history.push({
											pathname: `/post-detail/${item.id}`,
											state: item.id,
										})
									}}
								>
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
													{moment(item.data.timeCreate?.seconds * 1000).format(
														'HH:mm DD/MM/YYYY'
													)}
												</span>
											</div>
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
												{item?.data.category && (
													<span
														style={{ color: 'blue', fontSize: '14px' }}
													>{`#${item?.data?.category}`}</span>
												)}
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
										<div className='postBottom'>
											<div className='postBottomLeft'>
												<HeartOutlined style={{ marginRight: '5px' }} />
												<span>{item.data.reaction.length} lượt thích</span>
											</div>
											<div className='postBottomRight'>
												{/* <span>{countComment} bình luận</span> */}
											</div>
										</div>
									</div>
								</div>
							)
						}
					})}
				</div>
			</div>
		</div>
	)
}
