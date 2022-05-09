import React from 'react'

export default function Container(props) {
	const { header, body, footer } = props
	return (
		<>
			<div style={{ marginBottom: '20px' }}>{header ? header() : <></>}</div>
			{body ? body() : <></>}
			{footer ? footer() : <></>}
		</>
	)
}
