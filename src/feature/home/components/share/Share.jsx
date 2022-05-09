import React, { useContext, useState } from 'react'
import './share.css'
import {
	EnvironmentOutlined,
	FileImageFilled,
	RocketFilled,
	SmileFilled,
	TagFilled,
	UserOutlined,
} from '@ant-design/icons'
import { message, Modal, notification } from 'antd'
import Inmodal from './Inmodal'
import Avatar from 'antd/lib/avatar/avatar'
import { AuthContext } from '../../../../Context/AuthProvider'

export default function Share() {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isUpImage, setIsUpImage] = useState(false)
	const [showLocation, setShowLocation] = useState(false)

	const infoUser = useContext(AuthContext)

	const showModal = () => {
		if (infoUser.id === '') {
			// notification['warning']({
			// 	message: 'Nhắc nhở',
			// 	duration: 2,
			// 	description: 'Bạn cần đăng nhập để có thể tương tác với hệ thống!',
			// })
			message.warn('Bạn cần đăng nhập để có thể tương tác với hệ thống!')
		} else {
			setIsModalVisible(true)
		}
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}

	return (
		<div className='share'>
			<div className='shareWrapper'>
				<div className='shareTop'>
					{/* <img className="shareProfileImg" src="https://toigingiuvedep.vn/wp-content/uploads/2021/06/hinh-anh-gai-xinh-de-thuong-nhat-1-580x362.jpg" alt="" /> */}
					<Avatar
						style={{
							marginRight: '10px',
							marginLeft: '10px',
						}}
						size={50}
						src={infoUser.data.avatar}
						icon={infoUser.id === '' ? <UserOutlined /> : ''}
					>
						{infoUser.data.avatar
							? ''
							: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
					</Avatar>

					<button className='shareSelect' onClick={showModal}>
						Bạn muốn review hay hỏi cái gì không?
					</button>
				</div>
				<hr className='shareHr' />
				<div className='shareBottom'>
					<div className='shareOption' onClick={showModal}>
						<FileImageFilled
							style={{ color: 'orangered' }}
							className='shareIcon'
						/>
						<span className='shareOptionText'>Ảnh</span>
					</div>
					{/* <div className='shareOption' onClick={showModal}>
						<TagFilled style={{ color: 'blue' }} className='shareIcon' />
						<span className='shareOptionText'>Tag</span>
					</div> */}
					<div className='shareOption' onClick={showModal}>
						<EnvironmentOutlined
							style={{ color: 'green' }}
							className='shareIcon'
						/>
						<span className='shareOptionText'>Ví trí</span>
					</div>
					{/* <div className='shareOption' onClick={showModal}>
						<SmileFilled style={{ color: 'violet' }} className='shareIcon' />
						<span className='shareOptionText'>Feelings</span>
					</div> */}
				</div>
			</div>

			{/* modal đăng bài */}
			<Modal
				title='Tạo bài review'
				visible={isModalVisible}
				onCancel={handleCancel}
				maskClosable={false}
				footer={null}
			>
				<Inmodal
					infoUser={infoUser}
					//ẩn hiện modal
					isModalVisible={isModalVisible}
					setIsModalVisible={setIsModalVisible}
					//thêm ảnh
					isUpImage={isUpImage}
					setIsUpImage={setIsUpImage}
					//thêm vị trí
					showLocation={showLocation}
					setShowLocation={setShowLocation}
				/>
			</Modal>
		</div>
	)
}
