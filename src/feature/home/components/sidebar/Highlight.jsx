import React from 'react'
import logo from '../../../../assets/images/logo.jpg'

export default function Highlight({ id, data }) {
	return (
		<div className='highlight'>
			<div className='highlightLeft'>
				<img className='highlightImg' src={logo} />
			</div>
			<div className='highlightRight'>
				<div>{data.name}</div>
				<div>{data.postId.length} bài viết</div>
			</div>
		</div>
	)
}
