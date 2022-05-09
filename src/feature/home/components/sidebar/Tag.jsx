import React from 'react'

export default function Tag(props) {
	const { id, data } = props
	return (
		<div
			className='tag'
			onClick={() => {
				console.log(id)
			}}
		>
			{data.name}
		</div>
	)
}
