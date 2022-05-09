import { EllipsisOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Modal } from 'antd'
import React, { Image, useContext, useEffect, useState } from 'react'
import { ListUserContext } from '../../../../Context/ListUserProvider'
import useConvertTime from '../../../../hook/useConvertTime'
import './comment.css'

export default function Comment({ id, data }) {
	const listUser = useContext(ListUserContext)
	const [author, setAuthor] = useState()
	useEffect(() => {
		setAuthor(...listUser.filter((item) => item.id === data.userId))
	})

	return (
		<div className='comment'>
			<div className='commentLeft'>
				<Avatar
					src={author?.data?.avatar}
					icon={author?.id === '' ? <UserOutlined /> : ''}
				>
					{author?.data.avatar
						? ''
						: author?.data.displayName?.charAt(0)?.toUpperCase()}
				</Avatar>
			</div>
			<div className='commentRight'>
				<div className='commentRightTop'>
					<div className='cmtTop'>
						<span className='cmtUsername'>{author?.data?.displayName}</span>
						<span className='cmtDate'>
							{/* {moment(data.timeCreate?.seconds * 1000).format(
								'HH:mm DD/MM/YYYY'
							)} */}
							{useConvertTime(data.timeCreate?.seconds)}
						</span>
					</div>
					{/* <div className='cmtRight'>
						<EllipsisOutlined />
					</div> */}
				</div>
				<div className='commentRightCenter' style={{ whiteSpace: 'pre-wrap' }}>
					{`${data.content}`}
				</div>
				<div>
					{data.mediaUrl.length > 0 ? (
						data.mediaUrl.map((item, index) => (
							<img
								key={index}
								className='postImg'
								src={item}
								alt='image'
								style={{ width: '150px' }}
							/>
						))
					) : (
						<></>
					)}
				</div>
			</div>
		</div>
	)
}
