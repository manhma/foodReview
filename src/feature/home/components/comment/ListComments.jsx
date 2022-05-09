import {
	FileImageOutlined,
	SmileOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Avatar, Dropdown, message, Upload } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../../Context/AuthProvider'
import { db } from '../../../../firebase/config'
import { addDocument } from '../../../../firebase/services'
import { IS_ACTIVE, NOTIFICATION_TYPE } from '../../../../utils/constants'
import Comment from './Comment'
import './listComments.css'
import Picker from 'emoji-picker-react'

export default function Comments({ postId, dataPost }) {
	const infoUser = useContext(AuthContext)
	const [listComment, setListComment] = useState([])
	const [contentCmt, setContentCmt] = useState('')

	//comment image
	const [fileList, setFileList] = useState([])
	const [showUploadImage, setShowUploadImage] = useState(false)
	const onChange = ({ fileList: newFileList, file, event }) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
		if (!isJpgOrPng) {
			message.error('Vui lòng nhập định dạng JPG/PNG!')
			return
		}
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

	const handleChange = (e) => {
		setContentCmt(e.target.value)
	}

	//emoji
	const onEmojiClick = (event, emojiObject) => {
		// console.log('event', event)
		// console.log('emojiObject', emojiObject)
		setContentCmt(contentCmt + emojiObject.emoji)
	}

	const handleSubmit = () => {
		if (infoUser.id) {
			if (contentCmt || fileList.length !== 0) {
				try {
					const media = fileList.map((item) => item.thumbUrl)
					addDocument('comments', {
						postId: postId,
						userId: infoUser.id,
						content: contentCmt,
						mediaUrl: media,
						isActive: IS_ACTIVE.ACTIVE,
					})
					addDocument('notifications', {
						fromUserId: infoUser.id,
						fromUserName: infoUser.data.displayName,
						toUserId: dataPost.userId,
						postId: postId,
						isRead: 0,
						type: NOTIFICATION_TYPE.COMMENT,
					})
				} catch (error) {
					console.log(error)
				} finally {
					setContentCmt('')
					setFileList([])
					setShowUploadImage(false)
				}
			} else {
				message.warn('Vui lòng nhập bình luận!')
			}
		} else {
			message.warn('Bạn cần đăng nhập để có thể tương tác với hệ thống!')
		}
	}

	useEffect(() => {
		try {
			db.collection('comments')
				// .where('status', '>=', 0)
				// .orderBy('status')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setListComment(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}, [])

	return (
		<div className='comments'>
			<hr className='postHr' />
			<div className='commentInput'>
				<div className='commentInputLeft'>
					<Avatar
						src={infoUser.data?.avatar}
						icon={infoUser.id === '' ? <UserOutlined /> : ''}
					>
						{infoUser.data.avatar
							? ''
							: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
					</Avatar>
				</div>
				<div className='commentInputRight'>
					<TextArea
						placeholder='Viết bình luận/ đánh giá'
						autoSize={{ maxRows: 3 }}
						bordered={false}
						onChange={handleChange}
						value={contentCmt}
					/>
					{showUploadImage ? (
						<>
							<div className='inModalUpload'>
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
					<div className='inputIcons'>
						<Dropdown
							trigger={['click']}
							overlay={<Picker onEmojiClick={onEmojiClick} />}
							placement='bottomRight'
						>
							<SmileOutlined className='inputIcon' />
						</Dropdown>

						<FileImageOutlined
							className='inputIcon'
							onClick={() => setShowUploadImage(!showUploadImage)}
						/>

						<button
							onClick={handleSubmit}
							className='submitCmt'
							style={{ cursor: 'pointer' }}
						>
							Đăng
						</button>
					</div>
				</div>
			</div>
			<div className='cmtScroll'>
				{listComment.map((item, index) => {
					if (item.data.postId === postId) {
						return <Comment key={index} id={item.id} data={item.data} />
					}
				})}
			</div>
		</div>
	)
}
