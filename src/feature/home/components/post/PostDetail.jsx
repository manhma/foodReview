import {
	CommentOutlined,
	EnvironmentOutlined,
	HeartOutlined,
	MoreOutlined,
	SaveOutlined,
	WarningOutlined,
} from '@ant-design/icons'
import {
	Avatar,
	Col,
	message,
	PageHeader,
	Popconfirm,
	Row,
	Typography,
	Dropdown,
	Menu,
	Affix,
} from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import FbImageLibrary from 'react-fb-image-grid'
import { useHistory, useLocation } from 'react-router-dom'
import { ListUserContext } from '../../../../Context//ListUserProvider'
import { AuthContext } from '../../../../Context/AuthProvider'
import { db } from '../../../../firebase/config'
import { addDocument } from '../../../../firebase/services'
import useConvertTime from '../../../../hook/useConvertTime'
import { IS_ACTIVE } from '../../../../utils/constants'
import ListComments from '../comment/ListComments'
import './post.css'

const { Paragraph } = Typography

export default function PostDetail() {
	const history = useHistory()
	const param = useLocation()
	const infoUser = useContext(AuthContext)
	const listUser = useContext(ListUserContext)
	const [author, setAuthor] = useState()
	const [postDetail, setPostDetail] = useState({})

	useEffect(() => {
		try {
			db.collection('posts')
				.doc(param.state)
				.onSnapshot((doc) => {
					console.log('Current data: ', doc.data())
					const document = {
						data: doc.data(),
						id: doc.id,
					}
					setPostDetail(document)
				})
		} catch (error) {
			console.log(error)
		}
	}, [param])

	useEffect(() => {
		setAuthor(
			...listUser.filter((item) => item.id === postDetail?.data?.userId)
		)
	})

	const handleLike = () => {
		if (
			postDetail.data.reaction.filter((uid) => uid === infoUser.id).length === 0
		) {
			db.collection('posts')
				.doc(postDetail.id)
				.update({ reaction: [...postDetail.data.reaction, infoUser.id] })
			addDocument('notifications', {
				fromUserId: infoUser.id,
				fromUserName: infoUser.data.displayName,
				toUserId: postDetail.data.userId,
				postId: postDetail.id,
				isRead: 0,
				type: 1,
			})
		} else {
			const listLike = postDetail.data.reaction.filter(
				(uid) => uid !== infoUser.id
			)
			db.collection('posts').doc(postDetail.id).update({ reaction: listLike })
		}
	}

	const handleSavePost = () => {
		try {
			let listPostSave = infoUser.data.listPostSave
			db.collection('users')
				.doc(infoUser.id)
				.update({ listPostSave: [...listPostSave, postDetail.id] })
			message.success('B???n ???? l??u th??nh c??ng b??i vi???t v??o m???c b??i vi???t ???? l??u!')
		} catch (error) {
			console.log(error)
		}
	}

	console.log(postDetail)

	return (
		<div>
			<Affix>
				<Row>
					<Col span={16} offset={4}>
						<PageHeader
							className='site-page-header'
							onBack={() => history.goBack()}
							title='Chi ti???t b??i ????ng'
							style={{
								width: '100%',
								borderRadius: '10px',
								boxShadow: '0px 0px 16px -8px rgba(0, 0, 0, 0.68)',
							}}
						/>
					</Col>
				</Row>
			</Affix>

			<Row>
				<Col span={12} offset={6}>
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
									<span className='postUsername'>
										{author?.data?.displayName}
									</span>
									<span className='postDate'>
										{useConvertTime(postDetail?.data?.timeCreate?.seconds)}
									</span>
								</div>
								{/* <div className='postTopRight'>
									<MoreOutlined style={{ fontSize: '18px' }} />
								</div> */}
								<div className='postTopRight' style={{ paddingRight: '12px' }}>
									<Dropdown
										overlay={
											<Menu>
												{postDetail?.data?.userId === infoUser.id && (
													<Menu.Item
														key='edit-post'
														onClick={() => {
															history.push({
																pathname: `/edit-post/${postDetail?.id}`,
																state: postDetail?.id,
															})
														}}
													>
														S???a b??i vi???t
													</Menu.Item>
												)}

												{postDetail?.data?.userId === infoUser.id && (
													<Menu.Item
														key='delete-post'
														onClick={() => {
															try {
																if (
																	postDetail?.data?.isActive ===
																	IS_ACTIVE.ACTIVE
																) {
																	db.collection('posts')
																		.doc(postDetail?.id)
																		.update({ isActive: IS_ACTIVE.INACTIVE })
																	message.success(
																		'B???n ???n b??i vi???t tr??n trang tin h??? th???ng!'
																	)
																} else {
																	db.collection('posts')
																		.doc(postDetail?.id)
																		.update({ isActive: IS_ACTIVE.ACTIVE })
																	message.success(
																		'???? hi???n th??? l???i b??i vi???t tr??n trang tin h??? th???ng!'
																	)
																}
															} catch (error) {
																console.log(error)
															}
														}}
													>
														{postDetail?.data?.isActive === IS_ACTIVE.ACTIVE
															? '???n b??i vi???t'
															: 'Hi???n th??? b??i vi???t'}

														{postDetail?.data?.userId !== infoUser.id && (
															<Menu.Item
																key='report-post'
																onClick={() =>
																	message.warn(
																		'H??? th???ng ??ang b???o tr?? ch???c n??ng n??y!'
																	)
																}
															>
																B??o c??o b??i vi???t
															</Menu.Item>
														)}
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
												? {
														rows: 5,
														expandable: true,
														symbol: '[Xem th??m ...]',
												  }
												: false
										}
									>
										{postDetail?.data?.content}
									</Paragraph>
								</div>
								<div>
									{postDetail?.data?.category && (
										<span
											style={{ color: 'blue', fontSize: '14px' }}
										>{`#${postDetail?.data?.category}`}</span>
									)}
									{postDetail?.data?.location.city && (
										<span style={{ marginLeft: '20px', color: 'green' }}>
											<EnvironmentOutlined />
											{postDetail?.data?.location?.ward}--
											{postDetail?.data?.location?.district}--
											{postDetail?.data?.location?.city}
										</span>
									)}
								</div>
								{postDetail?.data?.note && (
									<div>
										<WarningOutlined
											style={{ color: 'tomato', fontSize: '35px' }}
										/>
										C???nh b??o b??i vi???t kh??ng ???????c duy???t: {postDetail?.data?.note}
									</div>
								)}
								{postDetail?.data?.isActive === IS_ACTIVE.INACTIVE && (
									<div>
										<WarningOutlined
											style={{ color: 'tomato', fontSize: '35px' }}
										/>
										B??i vi???t hi???n ??ang ???????c ???n tr??n trang tin h??? th???ng!
									</div>
								)}
								<div style={{ display: 'flex', justifyContent: 'center' }}>
									<div style={{ width: '55%' }}>
										<FbImageLibrary
											hideOverlay={true}
											images={postDetail?.data?.media}
											countFrom={5}
											renderOverlay={() => 'Xem ???nh'}
										/>
									</div>
								</div>
							</div>
							<div className='postBottom'>
								<div className='postBottomLeft'>
									<HeartOutlined style={{ marginRight: '5px' }} />
									<span>{postDetail?.data?.reaction.length} l?????t th??ch</span>
								</div>
								<div className='postBottomRight'>
									{/* <span>{countComment} b??nh lu???n</span> */}
								</div>
							</div>
							<hr className='postHr' />
							<div className='postEnd'>
								<div className='postEnds postEndLeft' onClick={handleLike}>
									{postDetail?.data?.reaction.find(
										(uid) => uid === infoUser.id
									) ? (
										<>
											<HeartOutlined className='postIcon-active' />
											<span
												style={{
													color: 'red',
													fontSize: '17px',
													fontWeight: 'bold',
												}}
											>
												Y??u th??ch
											</span>
										</>
									) : (
										<>
											<HeartOutlined className='postIcon' />
											<span>Y??u th??ch</span>
										</>
									)}
								</div>
								<div className='postEnds postEndCenter'>
									<CommentOutlined className='postIcon' />
									<span>B??nh lu???n</span>
								</div>

								{infoUser?.data?.listPostSave?.find(
									(postId) => postId === postDetail.id
								) ? (
									<div
										className='postEnds postEndRight'
										style={{ color: 'blue' }}
									>
										<SaveOutlined
											className='postIcon'
											style={{ cursor: 'not-allowed' }}
										/>
										<span>???? l??u</span>
									</div>
								) : postDetail?.data?.userId === infoUser.id ? (
									<div className='postEnds postEndRight'>
										<SaveOutlined
											className='postIcon'
											style={{ cursor: 'not-allowed' }}
										/>
										<span>L??u</span>
									</div>
								) : (
									<Popconfirm
										placement='topRight'
										title='B???n c?? mu???n l??u b??i vi???t n??y?'
										onConfirm={handleSavePost}
										okText='L??u'
										cancelText='Quay l???i'
									>
										<div className='postEnds'>
											<SaveOutlined className='postIcon' />
											<span>L??u</span>
										</div>
									</Popconfirm>
								)}
							</div>
							<ListComments
								postId={postDetail?.id}
								postDetail={postDetail?.data}
							/>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	)
}
