import { UpCircleOutlined } from '@ant-design/icons'
import { BackTop } from 'antd'
import React, { useContext } from 'react'
import { ListPostContext } from '../../../../Context/ListPostProvider'
import { IS_ACTIVE } from '../../../../utils/constants'
import Post from '../post/Post'
import Share from '../share/Share'

export default function News() {
	const listPost = useContext(ListPostContext)

	const style = {
		height: 40,
		width: 40,
		lineHeight: '40px',
		borderRadius: 4,
		backgroundColor: '#1088e9',
		color: '#fff',
		textAlign: 'center',
		fontSize: 30,
	}

	return (
		<div className='news'>
			<div className='newsBody'>
				<Share />
				{listPost.map((item, index) => {
					if (
						item.data.status === 1 &&
						item.data.isActive === IS_ACTIVE.ACTIVE
					) {
						return <Post data={item.data} id={item.id} key={index} />
					}
				})}
				<BackTop>
					<div style={style}>
						<UpCircleOutlined />
					</div>
				</BackTop>
			</div>
		</div>
	)
}
