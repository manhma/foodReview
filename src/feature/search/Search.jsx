import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import { db } from '../../firebase/config'
import { IS_ACTIVE } from '../../utils/constants'
import Post from '../home/components/post/Post'
import { Row, Col, PageHeader } from 'antd'
import { ListPostContext } from '../../Context/ListPostProvider'
import { rmVN } from '../../utils/funcHelp'

export default function Search() {
	const location = useLocation()
	const history = useHistory()

	const listPostContext = useContext(ListPostContext)

	const [listSearch, setListSearch] = useState([])

	useEffect(() => {
		try {
			if (location.state.type === 'search_category') {
				db.collection('posts')
					.where('category', 'in', [location.state.key])
					.onSnapshot((snapshot) => {
						const documents = snapshot.docs.map((doc) => ({
							data: { ...doc.data() },
							id: doc.id,
						}))
						setListSearch(documents)
					})
			} else {
				console.log('key search: ', rmVN(location.state.key))
				const response = listPostContext.filter(
					(item) =>
						rmVN(item.data.content).includes(rmVN(location.state.key)) ||
						rmVN(item.data.location.city).includes(rmVN(location.state.key)) ||
						(item.data.category &&
							rmVN(item.data.category).includes(rmVN(location.state.key)))
				)
				setListSearch(response)
			}
		} catch (error) {
			console.log(error)
		}
	}, [listPostContext])

	return (
		<div>
			<Row>
				<Col span={18} offset={4}>
					<PageHeader
						className='site-page-header'
						onBack={() => history.goBack()}
						title={
							location.state.type === 'search_category'
								? `Kết quả tìm kiếm danh mục theo: 
                        ${location.state.key}`
								: `Kết quả tìm kiếm: 
								${location.state.key}`
						}
						style={{
							width: '100%',
							borderRadius: '10px',
							boxShadow: '0px 0px 16px -8px rgba(0, 0, 0, 0.68)',
						}}
					/>
				</Col>
			</Row>
			<Row>
				<Col span={12} offset={6}>
					{listSearch.map((item, index) => {
						if (
							item.data.status === 1 &&
							item.data.isActive === IS_ACTIVE.ACTIVE
						) {
							return <Post data={item.data} id={item.id} key={index} />
						}
					})}
				</Col>
			</Row>
		</div>
	)
}
