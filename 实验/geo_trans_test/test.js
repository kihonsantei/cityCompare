// test.js
import { getDistance, getGreatCircleBearing, computeDestinationPoint } from 'geolib'

const center = { latitude: 39.9042, longitude: 116.4074 }
const point = { latitude: 39.9142, longitude: 116.4174 }

const distance = getDistance(center, point)
const bearing = getGreatCircleBearing(center, point)

console.log('距离（米）:', distance)
console.log('方位角（°）:', bearing)

const dest = computeDestinationPoint(center, 1000, 45)
console.log('目标点坐标:', dest)