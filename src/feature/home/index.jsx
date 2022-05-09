import React from 'react'
import Container from '../../common/container/Container'
import Header from '../../common/header/Header'
import Body from './components/Body'

export default function Home() {
	return (
		<>
			<Container header={Header} body={Body} />
		</>
	)
}
