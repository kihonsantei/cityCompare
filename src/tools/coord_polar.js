import { getDistance, getGreatCircleBearing } from 'geolib'
/**
 * 计算每个点相对中心点的距离和方位角
 * @param {Object} centerPoint - 中心点 { latitude: number, longitude: number }
 * @param {Array} coordinates - 点数组 [{ latitude: number, longitude: number }]
 * @returns {Array} - 每个点的距离和方位角 [{ distance: number, bearing: number }]
 */


export function computeDistanceAndBearing(centerPoint, coord,mode="single") {
    if (mode=="single"){
        const distance = getDistance(centerPoint, coord)
        const bearing = getGreatCircleBearing(centerPoint, coord)
        return {
            "distance":distance,
            "bearing":bearing
        }
    }

}

import { computeDestinationPoint } from 'geolib'

/**
 * 给定中心点、距离和方位角，计算终点坐标
 * @param {Object} centerPoint - 中心点 { latitude, longitude }
 * @param {number} distance - 距离（单位：米）
 * @param {number} bearing - 方位角（单位：度，0=北，90=东，180=南，270=西）
 * @returns {Object} - 终点坐标 { latitude, longitude }
 */
export function computeSymmetricPoint(centerPoint, distance, bearing,mode="single") {
   if (mode=="single"){
     return computeDestinationPoint(centerPoint, distance, bearing);
   }
}