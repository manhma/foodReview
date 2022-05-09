import { EditOutlined } from '@ant-design/icons'
import { Avatar, Menu, Dropdown, Tag, message, Button } from 'antd'
import React, { useContext } from 'react'
import { db } from '../../firebase/config'
import { AuthContext } from '../../Context/AuthProvider'
import { ROLE, IS_ACTIVE } from '../../utils/constants'

export default function User({ id, data }) {
	const infoUser = useContext(AuthContext)

	const menu = (
		<Menu
			onClick={(item) => {
				handleRole(item)
			}}
		>
			<Menu.Item key={ROLE.ADMIN}>Quản trị viên</Menu.Item>
			<Menu.Item key={ROLE.MOD}>Mod</Menu.Item>
			<Menu.Item key={ROLE.USER}>Người dùng</Menu.Item>
		</Menu>
	)

	const tag = (role) => {
		if (role === ROLE.ADMIN) {
			return <Tag color='orange'>ADMIN</Tag>
		}
		if (role === ROLE.MOD) {
			return <Tag>MOD</Tag>
		}
	}

	const handleRole = (item) => {
		if (infoUser.id === id) {
			message.warn('Không thể thay đổi quyền của bản thân!')
			return
		}
		if (infoUser.data.role === 1) {
			try {
				db.collection('users')
					.doc(id)
					.update({ role: parseInt(item.key) })
			} catch (error) {
				console.log(error)
			}
		} else {
			message.error('Bạn cần là quản trị viên của hệ thống!')
		}
	}

	// const handleDeleteUser = () => {
	// 	if (infoUser.id === id) {
	// 		message.warn('Không thể xoá bản thân!')
	// 		return
	// 	}
	// 	if (infoUser.data.role === 1) {
	// 		try {
	// 			db.collection('users').doc(id).update({ isActive: IS_ACTIVE.INACTIVE })
	// 		} catch (error) {
	// 			console.log(error)
	// 		}
	// 	} else {
	// 		message.error('Bạn cần là quản trị viên của hệ thống')
	// 	}
	// }

	return (
		<div className='category'>
			<div className='userLeft'>
				<Avatar src={data?.avatar}>
					{data.avatar ? '' : data.displayName?.charAt(0)?.toUpperCase()}
				</Avatar>
				<span className='nameUser'>{data.displayName}</span>
				<span className='roleUser'>{tag(data.role)}</span>
			</div>
			<div className='userRight'>
				{/* <Button style={{ marginRight: '10px' }} onClick={handleDeleteUser}>
					Xoá
				</Button> */}
				<Dropdown overlay={menu} trigger={['click']}>
					<EditOutlined className='editUser' />
				</Dropdown>
			</div>
		</div>
	)
}
