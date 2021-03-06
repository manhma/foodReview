import { EnvironmentOutlined } from '@ant-design/icons'
import {
	Avatar,
	Button,
	Divider,
	Form,
	Input,
	Modal,
	Popconfirm,
	Typography,
} from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import FbImageLibrary from 'react-fb-image-grid'
import { AuthContext } from '../../Context/AuthProvider'
import firebase, { db } from '../../firebase/config'
import { addDocument } from '../../firebase/services'
import useConvertTime from '../../hook/useConvertTime'
import { NOTIFICATION_TYPE, STATUS_POST } from '../../utils/constants'

const { Paragraph } = Typography

export default function WaitingPost(props) {
	const { data, id } = props
	const infoUser = useContext(AuthContext)
	const [author, setAuthor] = useState({})
	const [showModalWarn, setShowModalWarn] = useState(false)

	useEffect(() => {
		try {
			db.collection('users')
				.doc(data.userId)
				.onSnapshot((item) => {
					const { displayName, avatar } = { ...item.data() }
					setAuthor({ displayName, avatar, id: item.id })
				})
		} catch (error) {
			console.log(error)
		}
	}, [])

	const handleAcceptPost = (status) => {
		try {
			db.collection('posts').doc(id).update({
				status: status,
				timeCreate: firebase.firestore.FieldValue.serverTimestamp(),
			})
			addDocument('notifications', {
				fromUserId: infoUser.id,
				fromUserName: infoUser.data.displayName,
				toUserId: author.id,
				postId: id,
				isRead: 0,
				type: NOTIFICATION_TYPE.ACCEPT_POST,
			})
		} catch (error) {
			console.log(error)
		}
	}

	const handleCancelPost = (value) => {
		try {
			db.collection('posts')
				.doc(id)
				.update({ note: value.text, status: STATUS_POST.NOT_CONFIRMED })
			addDocument('notifications', {
				fromUserId: infoUser.id,
				fromUserName: infoUser.data.displayName,
				toUserId: author.id,
				postId: id,
				isRead: 0,
				type: NOTIFICATION_TYPE.CANCEL_POST,
			})
		} catch (error) {
			console.log(error)
		} finally {
			setShowModalWarn(false)
		}
	}

	return (
		<>
			<div className='waitingPost'>
				<div className='waitingPostWrapper'>
					<div className='waitingPostTop'>
						<Avatar src={author.avatar} />
						<span className='postUsername'>{author.displayName}</span>
						<span className='postDate'>
							{useConvertTime(data.timeCreate?.seconds)}
						</span>
					</div>
					<div className='waitingPostCenter'>
						<span className='postText' style={{ whiteSpace: 'pre-wrap' }}>
							<Paragraph
								ellipsis={
									true
										? { rows: 5, expandable: true, symbol: '[Xem th??m ...]' }
										: false
								}
							>
								{data.content}
							</Paragraph>
						</span>
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
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<div style={{ width: '55%' }}>
								<FbImageLibrary
									hideOverlay={true}
									images={data.media}
									countFrom={5}
									renderOverlay={() => 'Xem ???nh'}
								/>
							</div>
						</div>
					</div>
					<Divider />
					<div className='waitingPostBottom'>
						<Popconfirm
							placement='topLeft'
							title='B??i vi???t n??y s??? ???????c hi???n th??? tr??n b???ng tin!'
							onConfirm={() => {
								handleAcceptPost(1)
							}}
							okText='?????ng ??'
							cancelText='Quay l???i'
						>
							<button className='btnWaitingPost btnOk'>OK Duy???t</button>
						</Popconfirm>

						<button
							className='btnWaitingPost btnNo'
							onClick={() => setShowModalWarn(true)}
						>
							Kh??ng duy???t
						</button>
					</div>
				</div>
			</div>
			<Modal
				visible={showModalWarn}
				footer={null}
				onCancel={() => setShowModalWarn(false)}
			>
				<Form onFinish={handleCancelPost} layout='vertical'>
					<Form.Item
						label='Th??ng b??o n???i dung kh??ng ???????c duy???t'
						name='text'
						rules={[{ required: true, message: 'Vui l??ng nh???p th??ng b??o!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item style={{ textAlign: 'right' }}>
						<Button type='primary' htmlType='submit'>
							G???i
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
