export const ROLE = {
	USER: 0, //người dùng bình thường
	ADMIN: 1, //quản trị viên
	MOD: 2, // người kiểm duyệt
}

export const IS_ACTIVE = {
	ACTIVE: 1, //hoạt động
	INACTIVE: 0, //không hoạt động
}

export const MEDIA_TYPE = {
	IMAGE: 0, //hình ảnh
	VIDEO: 1, //video
}

export const STATUS_POST = {
	PENDING: 0, // chờ duyệt
	CONFIRMED: 1, // đã duyệt
	REPORT: 2, // báo cáo
	NOT_CONFIRMED: -1,
}

export const NOTIFICATION_TYPE = {
	LIKE: 1, //yêu thích
	COMMENT: 2, //bình luận
	ACCEPT_POST: 3, //duyệt bài viết
	CANCEL_POST: 4, //không duyệt bài viết
	NEW_POST: 5, //có bài viết mới
	CHANGE_ROLE: 6, //thay đổi quyền người dùng
	REUP_POST: 7, //yêu cầu duyệt bài đã qua chỉnh sửa
}
