import { Avatar, BackTop, Col, Row } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../common/header/Header'
import { AuthContext } from '../../Context/AuthProvider'
import { ListPostContext } from '../../Context/ListPostProvider'
import DetailProfile from './DetailProfile'
import ProfilePost from './ProfilePost'
import { IS_ACTIVE, STATUS_POST } from '../../utils/constants'
import './ProfileUser.css'
import { UpCircleOutlined } from '@ant-design/icons'

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

export default function ProfileUser() {
	const infoUser = useContext(AuthContext)
	const listPost = useContext(ListPostContext)
	const [countPost, setCountPost] = useState(0)
	const [posted, setPosted] = useState([])

	const list = []

	useEffect(() => {
		listPost.forEach((post) => {
			if (post.data.userId === infoUser.id) {
				if (post.data.status === IS_ACTIVE.ACTIVE) {
					list.push(post)
				}
			}
		})
		setPosted(list)
		setCountPost(list.length)
	}, [listPost, infoUser])

	return (
		<div>
			<Header />

			<div className='profile'>
				<div className='profileTop'>
					<div className='profileCover'>
						<img
							className='profileCoverImg'
							src='https://tonghop.vn/wp-content/uploads/2019/02/FILE-20170314-1554KQTUND9YYZQQ.png'
						/>
						<Avatar className='profileUserImg' src={infoUser.data?.avatar}>
							<p style={{ fontSize: '80px', paddingTop: '50px' }}>
								{infoUser.data.avatar
									? ''
									: infoUser.data.displayName?.charAt(0)?.toUpperCase()}
							</p>
						</Avatar>
					</div>
					<div className='profileInfo'>
						<h1 className='profileInfoName'>{infoUser.data.displayName}</h1>
						<span className='profileInfoDesc'>
							Chào bạn đã đến với hệ thông Food Review của chúng tôi!
						</span>
					</div>
				</div>
				<div className='profileBody'>
					<Row>
						<Col span={8}>
							<DetailProfile
								id={infoUser.id}
								data={infoUser.data}
								countPost={countPost}
							/>
						</Col>
						<Col span={16}>
							<ProfilePost
								posted={posted}
								//  getPostList={getPostList}
							/>
						</Col>
					</Row>
				</div>
			</div>
			<BackTop>
				<div style={style}>
					<UpCircleOutlined />
				</div>
			</BackTop>
		</div>
	)
}
