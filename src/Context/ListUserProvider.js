import React, { createContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'

export const ListUserContext = createContext()

export default function ListUserProvider({ children }) {
	const [listUser, setListUser] = useState([])

	useEffect(() => {
		try {
			db.collection('users').onSnapshot((snapshot) => {
				const documents = snapshot.docs.map((doc) => ({
					data: { ...doc.data() },
					id: doc.id,
				}))
				setListUser(documents)
			})
		} catch (error) {
			console.log(error)
		}
	}, [])

	return (
		<ListUserContext.Provider value={listUser}>
			{children}
		</ListUserContext.Provider>
	)
}
