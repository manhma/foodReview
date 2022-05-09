import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase/config'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
	const [infoUser, setInfoUser] = useState({
		id: '',
		data: {},
	})

	useEffect(() => {
		try {
			auth.onAuthStateChanged((user) => {
				if (user) {
					db.collection('users')
						.doc(user.uid)
						.onSnapshot((doc) => {
							setInfoUser({
								id: doc.id,
								data: doc.data(),
							})
						})
					return
				}
			})
		} catch (error) {
			console.log(error)
		}
	}, [])

	return (
		<AuthContext.Provider value={infoUser}>{children}</AuthContext.Provider>
	)
}
