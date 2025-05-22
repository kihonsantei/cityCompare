import { computeDestinationPoint } from 'geolib'
import shpwrite from 'shp-write'
import fs from 'fs'

// 中心点
const center = { latitude: 39.9042, longitude: 116.4074 }
const radiusMeters = 100000

// 构建 GeoJSON FeatureCollection
const features = []

// 添加中心点
features.push({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [center.longitude, center.latitude]
  },
  properties: { label: 'center' }
})

// 添加每隔 45° 的点
for (let angle = 0; angle < 360; angle += 45) {
  const dest = computeDestinationPoint(center, radiusMeters, angle)
  features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [dest.longitude, dest.latitude]
    },
    properties: { label: `${angle}deg` }
  })
}

// 将 GeoJSON 按照 shp-write 的格式分离
const geojson = {
  type: 'FeatureCollection',
  features: features
}

const options = {
  folder: 'shapes',
  types: {
    point: 'points'
  }
}

// 直接返回一个 ArrayBuffer
const buffer = shpwrite.zip(geojson)

fs.writeFileSync('./points.zip', Buffer.from(buffer))
console.log('✅ 导出完成，文件为 points.zip')