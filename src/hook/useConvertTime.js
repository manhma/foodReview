const useConvertTime = (props) => {
	const now = new Date().getTime()
	const timeCreate = new Date(props * 1000).getTime()
	const timeOrigin = now - timeCreate
	let time = (timeOrigin - (timeOrigin % (1000 * 60))) / (1000 * 60)
	if (time <= 1) {
		return 'vừa xong'
	} else if (time < 60) {
		return `${time} phút trước`
	} else if (time < 60 * 24) {
		time = (timeOrigin - (timeOrigin % (1000 * 60 * 60))) / (1000 * 60 * 60)
		return `${time} tiếng trước`
	} else if (time > 60 * 24) {
		const time3 =
			(timeOrigin - (timeOrigin % (1000 * 60 * 60 * 24))) /
			(1000 * 60 * 60 * 24)
		return `${time3} ngày trước`
	} else {
		return 'vừa xong'
	}
}

export default useConvertTime
