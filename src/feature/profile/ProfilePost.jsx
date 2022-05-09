import { MenuOutlined, SaveOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import React, { useState, useEffect, useContext } from 'react'
import Post from '../home/components/post/Post'
import PostSave from './PostSave'
import { AuthContext } from '../../Context/AuthProvider'
import PostCancel from './PostCancel'

export default function ProfilePost({
	posted,
	// getPostList
}) {
	const infoUser = useContext(AuthContext)
	const [postSelect, setPostSelect] = useState('post')
	const selectMenu = (menuKey) => {
		setPostSelect(menuKey.key)
	}

	// useEffect(() => {
	// 	getPostList()
	// }, [])

	return (
		<div className='profilePostWrapper'>
			<div className='contentTop'>
				<span
					style={{ fontSize: '20px', fontWeight: '500', paddingLeft: '20px' }}
				>
					Bài viết
				</span>
				<hr />

				<Menu onSelect={selectMenu} defaultSelectedKeys={['post']}>
					<Menu.Item key='post' icon={<MenuOutlined />}>
						Bài viết của bạn
					</Menu.Item>
					<Menu.Item key='post-save' icon={<SaveOutlined />}>
						Bài viết đã lưu
					</Menu.Item>
					{infoUser.data.role === 0 && (
						<Menu.Item key='post-cancel' icon={<SaveOutlined />}>
							Bài viết bị từ chối
						</Menu.Item>
					)}
				</Menu>
			</div>
			<div>
				{postSelect === 'post' ? (
					posted.map((item, index) => (
						<Post data={item.data} id={item.id} key={index} />
					))
				) : postSelect === 'post-save' ? (
					<PostSave />
				) : postSelect === 'post-cancel' ? (
					<PostCancel />
				) : (
					<></>
				)}
			</div>
		</div>
	)
}
