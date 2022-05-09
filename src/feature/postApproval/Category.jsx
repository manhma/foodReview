import { DeleteOutlined } from '@ant-design/icons'
import { message, Popconfirm } from 'antd'
import React from 'react'
import { db } from '../../firebase/config'
import { IS_ACTIVE } from '../../utils/constants'

export default function Category({ id, data }) {
	const handleDeleteCategory = async (id) => {
		try {
			await db
				.collection('categorys')
				.doc(id)
				.update({ isActive: IS_ACTIVE.INACTIVE })
			message.success('Xoá danh mục thành công!')
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<div className='category'>
			<span>{data.name}</span>
			<Popconfirm
				placement='bottomRight'
				title='Bạn có chắc chắn muốn xoá'
				onConfirm={() => {
					handleDeleteCategory(id)
				}}
				okText='Đồng ý'
				cancelText='Quay lại'
			>
				<DeleteOutlined className='iconCate' />
			</Popconfirm>
		</div>
	)
}
