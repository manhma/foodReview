import firebase, { db } from './config'

//hàm thêm mới vào cloud firestore có khởi tạo id(doc)
export const setDocument = async (collection, doc, data) => {
	try {
		const response = await db
			.collection(collection)
			.doc(doc)
			.set({
				...data,
				timeCreate: firebase.firestore.FieldValue.serverTimestamp(),
			})
		return response
	} catch (error) {
		console.log(error)
		return
	}
}

//hàm thêm mới vào cloud firestore tạo id(doc) ngẫu nhiên
export const addDocument = async (collection, data) => {
	try {
		const response = await db.collection(collection).add({
			...data,
			timeCreate: firebase.firestore.FieldValue.serverTimestamp(),
		})
		return response
	} catch (error) {
		console.log(error)
		return
	}
}

//hàm update document vào cloud firestore
export const updateDocument = async (collection, document, dataUpdate) => {
	try {
		const response = db.collection(collection).doc(document).update(dataUpdate)
		return response
	} catch (error) {
		console.log(error)
		return
	}
}
