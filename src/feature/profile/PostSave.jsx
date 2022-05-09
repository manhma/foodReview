import React, { useContext } from 'react'
import { AuthContext } from '../../Context/AuthProvider'
import { ListPostContext } from '../../Context/ListPostProvider'
import Post from '../home/components/post/Post'

export default function PostSave() {
	const infoUser = useContext(AuthContext)
	const listPost = useContext(ListPostContext)
	let listPostSaveId = infoUser.data?.listPostSave
	let listPostSave = []

	return (
		listPostSaveId && (
			<div>
				{listPost.forEach((item) => {
					listPostSaveId.forEach((id) => {
						if (id === item.id) {
							listPostSave.push(item)
						}
					})
				})}
				{listPostSave.map((item, index) => (
					<Post data={item.data} id={item.id} key={index} />
				))}
			</div>
		)
	)
}
