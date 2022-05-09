import firebase from 'firebase/app'
import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/firestore'

var firebaseConfig = {
	//firebase cũ
	// apiKey: 'AIzaSyDr97EVfllKLZl9mL6fT6ibefeUMGzbB5U',
	// authDomain: 'chatting-391fc.firebaseapp.com',
	// projectId: 'chatting-391fc',
	// storageBucket: 'chatting-391fc.appspot.com',
	// messagingSenderId: '631437948080',
	// appId: '1:631437948080:web:cab0bb6b0a797bafa47775',

	//firebase mới
	apiKey: 'AIzaSyC6NNSdsNIHm3-G3o-sK9IT4-vlaH2W120',
	authDomain: 'food-review-67be4.firebaseapp.com',
	projectId: 'food-review-67be4',
	storageBucket: 'food-review-67be4.appspot.com',
	messagingSenderId: '955706430963',
	appId: '1:955706430963:web:08cf4b560f93e5bcad6e86',
	measurementId: 'G-NMN53BBX26',
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()

const auth = firebase.auth()
const db = firebase.firestore()

//Firebase local
// auth.useEmulator('http://localhost:9099')
// if (window.location.hostname === 'localhost') {
// 	db.useEmulator('localhost', '8080')
// }
//End firebase local

export { auth, db }
export default firebase
