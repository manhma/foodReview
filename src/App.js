import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Login from './auth'
import Register from './auth/Register'
import AuthProvider from './Context/AuthProvider'
import ListPostProvider from './Context/ListPostProvider'
import ListUserProvider from './Context/ListUserProvider'
import NotificationProvider from './Context/NotificationProvider'
import Home from './feature/home'
import EditPost from './feature/home/components/post/EditPost'
import PostDetail from './feature/home/components/post/PostDetail'
import PostApproval from './feature/postApproval/PostApproval'
import ProfileUser from './feature/profile/ProfileUser'
import Search from './feature/search/Search'
import Manh from './feature/home/components/news/Manh'

export function App() {
	return (
		<Router>
			<ListUserProvider>
				<AuthProvider>
					<ListPostProvider>
						<NotificationProvider>
							<div>
								<Switch>
									<Route path='/login' component={Login} />
									<Route path='/register' component={Register} />
									<Route path='/' exact component={Home} />
									<Route path='/post-approval' component={PostApproval} />
									<Route path='/profile' component={ProfileUser} />
									<Route path='/post-detail/:id' component={PostDetail} />
									<Route path='/edit-post/:id' component={EditPost} />
									<Route path='/search/:name' component={Search} />
									<Route path='/manh' component={Manh} />
								</Switch>
							</div>
						</NotificationProvider>
					</ListPostProvider>
				</AuthProvider>
			</ListUserProvider>
		</Router>
	)
}
