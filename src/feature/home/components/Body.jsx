import { Col, Row } from 'antd'
import React from 'react'
import News from './news/News'
import RightBar from './rightbar/RightBar'
import Sidebar from './sidebar/Sidebar'

export default function Body() {
	return (
		<div>
			<Row>
				<Col span={6}>
					<Sidebar />
				</Col>
				<Col span={12}>
					<News />
				</Col>
				<Col span={6}>
					<RightBar />
				</Col>
			</Row>
		</div>
	)
}
