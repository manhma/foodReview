import React from 'react'
import { rmVN } from '../../../../utils/funcHelp'

export default function Manh() {
	const s = 'Hà Nội đẹp nhất về đêm, cũng chính là lúc anh ôm em thật chặt'
	console.log(rmVN(s).includes(rmVN('bay')))
	return <div>sdfs</div>
}
