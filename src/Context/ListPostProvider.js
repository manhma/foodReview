import { LoadingOutlined } from '@ant-design/icons'
import { Alert, Spin } from 'antd'
import React, { createContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'

export const ListPostContext = createContext()

export default function ListPostProvider({ children }) {
	const [listPost, setListPost] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		try {
			db.collection('posts')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setListPost(documents)
					setIsLoading(false)
				})
		} catch (error) {
			console.log(error)
		}
	}, [])

	return (
		<ListPostContext.Provider value={listPost}>
			{isLoading ? (
				<Spin indicator={<LoadingOutlined style={{ fontSize: 35 }} spin />}>
					<Alert
						message='Thông báo'
						description='Vui lòng đợi hệ thống xử lý!'
						type='info'
						style={{ textAlign: 'center' }}
					/>
				</Spin>
			) : (
				children
			)}
		</ListPostContext.Provider>
	)
}
