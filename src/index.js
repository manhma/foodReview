import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import { App } from './App'
import { store } from './app/store'
import { Provider } from 'react-redux'

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)
