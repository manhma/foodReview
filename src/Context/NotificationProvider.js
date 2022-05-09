import React, { createContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'

export const NotificationContext = createContext()

export default function NotificationProvider({ children }) {
	const [dataNotification, setDataNotification] = useState([])

	useEffect(() => {
		try {
			db.collection('notifications')
				.orderBy('timeCreate', 'desc')
				.onSnapshot((snapshot) => {
					const documents = snapshot.docs.map((doc) => ({
						data: { ...doc.data() },
						id: doc.id,
					}))
					setDataNotification(documents)
				})
		} catch (error) {
			console.log(error)
		}
	}, [])

	return (
		<NotificationContext.Provider value={dataNotification}>
			{children}
		</NotificationContext.Provider>
	)
}
