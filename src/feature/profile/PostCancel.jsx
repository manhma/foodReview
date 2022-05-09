import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Context/AuthProvider'
import { ListPostContext } from '../../Context/ListPostProvider'
import Post from '../home/components/post/Post'

export default function PostCancel() {
	const infoUser = useContext(AuthContext)
	const listPost = useContext(ListPostContext)

	const listPostCancel = []

	listPost.forEach((post) => {
		if (post.data.userId === infoUser.id) {
			if (post.data.status === -1) {
				listPostCancel.push(post)
			}
		}
	})

	return (
		<div>
			{listPostCancel.map((item, index) => (
				<Post data={item.data} id={item.id} key={index} />
			))}
		</div>
	)
}
