import {
	CommentOutlined,
	EnvironmentOutlined,
	HeartOutlined,
	MoreOutlined,
	SaveOutlined,
	WarningOutlined,
} from '@ant-design/icons'
import { Avatar, Dropdown, Menu, message, Popconfirm, Typography } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import FbImageLibrary from 'react-fb-image-grid'
import { useHistory } from 'react-router'
import { ListUserContext } from '../../../../Context//ListUserProvider'
import { AuthContext } from '../../../../Context/AuthProvider'
import { db } from '../../../../firebase/config'
import { addDocument } from '../../../../firebase/services'
import useConvertTime from '../../../../hook/useConvertTime'
import { IS_ACTIVE, NOTIFICATION_TYPE, ROLE } from '../../../../utils/constants'
import ListComments from '../comment/ListComments'
import './post.css'

const { Paragraph } = Typography

export default function Post(props) {
	const { data, id } = props
	const infoUser = useContext(AuthContext)
	const listUser = useContext(ListUserContext)
	const history = useHistory()
	const [author, setAuthor] = useState()
	const [postId, setpostId] = useState('')
	const [comments, setComments] = useState(false)

	useEffect(() => {
		setAuthor(...listUser.filter((item) => item.id === data.userId))
	})

	const handleLike = () => {
		if (infoUser.id) {
			if (data.reaction.filter((uid) => uid === infoUser.id).length === 0) {
				db.collection('posts')
					.doc(id)
					.update({ reaction: [...data.reaction, infoUser.id] })
				addDocument('notifications', {
					fromUserId: infoUser.id,
					fromUserName: infoUser.data.displayName,
					toUserId: data.userId,
					postId: id,
					isRead: 0,
					type: NOTIFICATION_TYPE.LIKE,
				})
			} else {
				//xử lí dislike
				const listLike = data.reaction.filter((uid) => uid !== infoUser.id)
				db.collection('posts').doc(id).update({ reaction: listLike })
			}
		} else {
			return message.warn('Bạn cần đăng nhập để có thể tương tác với hệ thống!')
		}
	}

	const handleComment = () => {
		setpostId(id)
		setComments(!comments)
	}

	const handleSavePost = () => {
		try {
			let listPostSave = infoUser.data.listPostSave
			db.collection('users')
				.doc(infoUser.id)
				.update({ listPostSave: [...listPostSave, id] })
			message.success('Bạn đã lưu thành công bài viết vào mục bài viết đã lưu!')
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className='post'>
			<div className='postWrapper'>
				<div className='postTop'>
					<div className='postTopLeft'>
						{author?.data?.avatar ? (
							<img
								className='postProfileImg'
								src={author?.data?.avatar}
								alt=''
							/>
						) : (
							<Avatar src={author?.data?.avatar}>
								{author?.data?.avatar
									? ''
									: author?.data?.displayName?.charAt(0)?.toUpperCase()}
							</Avatar>
						)}
						<span className='postUsername'>{author?.data?.displayName}</span>
						<span className='postDate'>
							{/* {moment(data.timeCreate?.seconds * 1000).format(
								'HH:mm DD/MM/YYYY'
							)} */}
							{useConvertTime(data.timeCreate?.seconds)}
						</span>
					</div>
					<div className='postTopRight' style={{ paddingRight: '12px' }}>
						<Dropdown
							overlay={
								<Menu>
									{data.userId === infoUser.id && (
										<Menu.Item
											key='edit-post'
											onClick={() => {
												history.push({
													pathname: `/edit-post/${id}`,
													state: id,
												})
											}}
										>
											Sửa bài viết
										</Menu.Item>
									)}

									{(data.userId === infoUser.id ||
										infoUser.data.role === ROLE.ADMIN) && (
										<Menu.Item
											key='delete-post'
											onClick={() => {
												try {
													if (data.isActive === IS_ACTIVE.ACTIVE) {
														db.collection('posts')
															.doc(id)
															.update({ isActive: IS_ACTIVE.INACTIVE })
														message.success(
															'Bạn ẩn bài viết trên trang tin hệ thống!'
														)
													} else {
														db.collection('posts')
															.doc(id)
															.update({ isActive: IS_ACTIVE.ACTIVE })
														message.success(
															'Đã hiện thị lại bài viết trên trang tin hệ thống!'
														)
													}
												} catch (error) {
													console.log(error)
												}
											}}
										>
											{data.isActive === IS_ACTIVE.ACTIVE
												? 'Ẩn bài viết'
												: 'Hiển thị bài viết'}
										</Menu.Item>
									)}

									{data.userId !== infoUser.id && (
										<Menu.Item
											key='report-post'
											onClick={() =>
												message.warn('Hệ thống đang bảo trì chức năng này!')
											}
										>
											Báo cáo bài viết
										</Menu.Item>
									)}
								</Menu>
							}
							placement='bottomRight'
							trigger={['click']}
							arrow
						>
							<MoreOutlined style={{ fontSize: '18px' }} />
						</Dropdown>
					</div>
				</div>
				<div className='postCenter'>
					<div style={{ whiteSpace: 'pre-wrap' }}>
						<Paragraph
							ellipsis={
								true
									? { rows: 5, expandable: true, symbol: '[Xem thêm ...]' }
									: false
							}
						>
							{data.content}
						</Paragraph>
					</div>
					<div>
						{data.category && (
							<span
								style={{ color: 'blue', fontSize: '14px' }}
							>{`#${data?.category}`}</span>
						)}
						{data.location.city && (
							<span style={{ marginLeft: '20px', color: 'green' }}>
								<EnvironmentOutlined />
								{data.location.ward}--{data.location.district}--
								{data.location.city}
							</span>
						)}
					</div>
					{data.note && (
						<div>
							<WarningOutlined style={{ color: 'tomato', fontSize: '35px' }} />
							Cảnh báo bài viết không được duyệt: {data.note}
						</div>
					)}
					{data.isActive === IS_ACTIVE.INACTIVE && (
						<div>
							<WarningOutlined style={{ color: 'tomato', fontSize: '35px' }} />
							Bài viết hiện đang được ẩn trên trang tin hệ thống!
						</div>
					)}
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<div style={{ width: '55%' }}>
							<FbImageLibrary
								hideOverlay={true}
								images={data.media}
								countFrom={5}
								renderOverlay={() => 'Xem ảnh'}
							/>
						</div>
					</div>
					{/* <Carousel autoplay={true}>
						{data.media.map((item, index) => {
							return <img key={index} className='postImg' src={item} alt='' />
						})}
					</Carousel> */}
					{/* {data.media.length === 1 && (
						<div>
							<Row gutter={[24, 8]}>
								<Image.PreviewGroup>
									{data.media.map((item, index) => (
										<Col span={24}>
											<Image src={item} />
										</Col>
									))}
								</Image.PreviewGroup>
							</Row>
						</div>
					)}
					{(data.media.length === 2 || data.media.length === 4) && (
						<div>
							<Row gutter={[24, 8]}>
								<Image.PreviewGroup>
									{data.media.map((item, index) => (
										<Col span={12}>
											<Image src={item} />
										</Col>
									))}
								</Image.PreviewGroup>
							</Row>
						</div>
					)}
					{data.media.length === 3 && (
						<div>
							<Row gutter={[24, 8]}>
								<Image.PreviewGroup>
									<Col span={12}>
										<Image style={{ height: '100%' }} src={data.media[0]} />
									</Col>
									<Col span={12}>
										<Row>
											<Col span={24}>
												<Image src={data.media[1]} />
											</Col>
										</Row>
										<Row>
											<Col span={24}>
												<Image src={data.media[2]} />
											</Col>
										</Row>
									</Col>
								</Image.PreviewGroup>
							</Row>
						</div>
					)}
					{data.media.length > 4 && (
						<div>
							<Row gutter={[24, 8]}>
								<Image.PreviewGroup>
									{data.media.map((item, index) => {
										if (index < 3) {
											return (
												<Col span={12}>
													<Image src={item} />
												</Col>
											)
										} else if (index === 3) {
											return (
												<Col span={12}>
													<div className='image-custom'>
														<Image src={item} />
														<div className='label-plus'>{`+${
															data.media.length - 4
														}`}</div>
													</div>
												</Col>
											)
										} else {
											return <Image src={item} style={{ display: 'none' }} />
										}
									})}
								</Image.PreviewGroup>
							</Row>
						</div>
					)} */}
				</div>
				<div className='postBottom'>
					<div className='postBottomLeft'>
						<HeartOutlined style={{ marginRight: '5px' }} />
						<span>{data.reaction.length} lượt thích</span>
					</div>
					<div className='postBottomRight'>
						{/* <span>{countComment} bình luận</span> */}
					</div>
				</div>
				<hr className='postHr' />
				<div className='postEnd'>
					<div className='postEnds postEndLeft' onClick={handleLike}>
						{data.reaction.find((uid) => uid === infoUser.id) ? (
							<>
								<HeartOutlined className='postIcon-active' />
								<span
									style={{
										color: 'red',
										fontSize: '17px',
										fontWeight: 'bold',
									}}
								>
									Yêu thích
								</span>
							</>
						) : (
							<>
								<HeartOutlined className='postIcon' />
								<span>Yêu thích</span>
							</>
						)}
					</div>
					<div className='postEnds postEndCenter' onClick={handleComment}>
						<CommentOutlined className='postIcon' />
						<span>Bình luận</span>
					</div>

					{infoUser.data?.listPostSave?.find((postId) => postId === id) ? (
						<div className='postEnds postEndRight' style={{ color: 'blue' }}>
							<SaveOutlined
								className='postIcon'
								style={{ cursor: 'not-allowed' }}
							/>
							<span>Đã lưu</span>
						</div>
					) : data.userId === infoUser.id ? (
						<div className='postEnds postEndRight'>
							<SaveOutlined
								className='postIcon'
								style={{ cursor: 'not-allowed' }}
							/>
							<span>Lưu</span>
						</div>
					) : (
						<Popconfirm
							placement='topRight'
							title='Bạn có muốn lưu bài viết này?'
							onConfirm={handleSavePost}
							okText='Lưu'
							cancelText='Quay lại'
						>
							<div className='postEnds'>
								<SaveOutlined className='postIcon' />
								<span>Lưu</span>
							</div>
						</Popconfirm>
					)}
				</div>
				{comments === true ? (
					<ListComments postId={postId} dataPost={data} />
				) : (
					<></>
				)}
			</div>
		</div>
	)
}
