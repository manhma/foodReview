import { createSlice } from '@reduxjs/toolkit'
const initialState = {}

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		addUser: (state, action) => {
			state.id = action.payload.id
			state.email = action.payload.email
			state.displayName = action.payload.displayName
			state.avatar = action.payload.avatar
			state.createAt = action.payload.createAt
		},
	},
})

export const { addUser } = authSlice.actions
export default authSlice.reducer
