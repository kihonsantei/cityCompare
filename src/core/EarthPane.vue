<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted,watch,computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { pickCenterStore } from '@/stores/PickCenterStore'
import { BallMovingScalingStore } from '@/stores/BallMovingScalingStore'
import { ballstateStore } from '@/stores/ballstateStore'
import { useMapZoomStore } from '@/stores/BallScalingStore'
import { CoordDetermine } from '@/stores/CreateMapCoordDetemineFeatureStore'
import { computeDistanceAndBearing } from '@/tools/coord_polar'
import { MapListStore } from '@/stores/MapListStroe'
import { DrawBallMap } from '@/stores/MapComponentStore'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
})


const usemapzoomstroe=useMapZoomStore()
const mapliststore=MapListStore()
const drawballmap=DrawBallMap()

const props = defineProps({
  id: String
})

console.log("初始化球",props.id,"成功")
const mapContainer = ref(null)
let mapInstance = null

function initMap(){
    if (mapInstance) {
    mapInstance.remove()  // 销毁旧地图，防止重复初始化
    }
    mapInstance = L.map(mapContainer.value,{
  zoomAnimation: false,
}).setView([39.9042, 116.4074], 13,{ animate: false })
    L.tileLayer('https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        attribution: '© 高德地图'
    }).addTo(mapInstance)
}

const pickcenter=pickCenterStore()

function setupPickingWatcher() {
  // 1. 在外层定义 clickHandler，保证引用一致
  const clickHandler = (e) => {
    const coord = [e.latlng.lng, e.latlng.lat]
    pickcenter.finishPicking(coord)
  }
  watch(
    () => pickcenter.isPicking,
    (newVal) => {
      if ((newVal) && (pickcenter.editball==props.id)) {
        console.log("地图",props.id,"响应拾取")
        mapInstance.on('click', clickHandler)
      } else {
        console.log("地图禁止拾取")
        mapInstance.off('click', clickHandler)
      }
    }
  )
}



const coorddetermine=CoordDetermine()

function setupCoordWatcher() {
  const tempPolygonPoints = [] // 暂存 polygon 点坐标

  // Point 拾取：点击地图时触发
  //转换成geolib的格式
  const pointClickHandler = (e) => {
    const coord ={
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }
      const centerpoint={
        latitude:mapliststore.views[currentBallId.value].center[1],
        longitude:mapliststore.views[currentBallId.value].center[0]
      }
      
      const newcoord=computeDistanceAndBearing(centerpoint,coord,"single")
      console.log("拾取的点距离是",newcoord.distance,"方位角是",newcoord.bearing)
      
    coorddetermine.finishPicking(newcoord)
  }

  // Polygon 拾取：点击地图添加点
  const polygonClickHandler = (e) => {
    const coord ={
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }
    const centerpoint={
      latitude:mapliststore.views[currentBallId.value].center[1],
      longitude:mapliststore.views[currentBallId.value].center[0]
    }
    const newcoord=computeDistanceAndBearing(centerpoint,coord,"single")
    console.log("拾取的点距离是",newcoord.distance,"方位角是",newcoord.bearing)
    tempPolygonPoints.push(newcoord)
    // 可选：可在此处临时绘制点或连线以做反馈
  }
  // Polygon 完成：右键结束拾取
  const polygonFinishHandler = () => {
    if (tempPolygonPoints.length >= 3) {

      //对tempPolygonPoints处理
      coorddetermine.finishPicking([...tempPolygonPoints])
    } else {
      console.warn("多边形至少需要三个点")
    }
    tempPolygonPoints.length = 0 // 清空
  }

  // 监听拾取状态变化
  watch(
    () => coorddetermine.isPicking,
    (newVal) => {
      const isActive = newVal && coorddetermine.editball === props.id
      if (isActive) {
        console.log("地图", props.id, "响应拾取")
        console.log(coorddetermine.coordtype)
        if (coorddetermine.coordtype === "point") {
          console.log("拾取点")
          mapInstance.on("click", pointClickHandler)
        } else if (coorddetermine.coordtype === "polygon") {
          console.log("拾取面")
          mapInstance.on("click", polygonClickHandler)
          mapInstance.on("contextmenu", polygonFinishHandler)
        }
      } else {
        console.log("不拾取")
        console.log("地图", props.id, "停止拾取")
        mapInstance.off("click", pointClickHandler)
        mapInstance.off("click", polygonClickHandler)
        mapInstance.off("contextmenu", polygonFinishHandler)
        tempPolygonPoints.length = 0
      }
    },
    
  )
}



const ballmovingscalingstore=BallMovingScalingStore()

function updateballscaling(){
    //console.log("地图",props.id,"上传状态,zoom",mapInstance.getZoom(),"中心",[mapInstance.getCenter().lng,mapInstance.getCenter().lat])
    ballmovingscalingstore.setZoomState(props.id,mapInstance.getZoom(),[mapInstance.getCenter().lng,mapInstance.getCenter().lat]) 
}

//绑定的函数
function setupupdateballscaling(){
    updateballscaling()
    mapInstance.on('moveend', updateballscaling)
}

//从ballstateStore中监控自己对应的球变没变
const ballstatestore=ballstateStore()

const currentBallId = computed(() => ballstatestore.getcurrentid(props.id))
console.log("初始化的地图id是",currentBallId.value)

let isProgrammaticMove = false

//监测BallID发生变化
//BallID变化是非常严重的问题，意味着我们的tag也要重画
watch(currentBallId, (newId) => {
    const state = usemapzoomstroe.getZoomState(newId)
    if (state && state.scale && state.zoomcenter) {
      mapInstance.setView([state.zoomcenter[1],state.zoomcenter[0]], state.scale,{ animate: false })
  }
})

//检测本身的变化
watch(() => usemapzoomstroe.zoomState[currentBallId.value],
  (val) => {
    if (!val) return;
    if (isProgrammaticMove) {
      // 已由程序触发，不再处理
      isProgrammaticMove = false;
      return;
    }

    isProgrammaticMove = true; // 标记这次是程序性移动，防止 moveend 再次更新状态
    mapInstance.setView(L.latLng(val.zoomcenter[1], val.zoomcenter[0]), val.scale,{ animate: false });
  },
  { deep: true }
)
//这个是根据地图的移动更新对应的Instance的状态
function renowalmapstate(){
    if (usemapzoomstroe.getZoomState(currentBallId.value)){
        if (!isProgrammaticMove) {
            //console.log("用户拖动地图，更新状态", currentBallId.value)
            usemapzoomstroe.updateZoom(
              currentBallId.value,
              [mapInstance.getCenter().lng, mapInstance.getCenter().lat],
              mapInstance.getZoom()
            )
        }
        isProgrammaticMove = false; // 重置标记
    }
}

function setuprenowalmapstate(){
    renowalmapstate()
    mapInstance.on('moveend', renowalmapstate)
}


const mountedLayers = ref([])

let isZooming = false
let pendingLayerUpdate = false



function setupZoomLayerProtection() {
  mapInstance.on('zoomstart', () => {
    isZooming = true
  })

  mapInstance.on('zoomend', () => {
  isZooming = false
  if (pendingLayerUpdate) {
    requestAnimationFrame(() => {
      doUpdateLayersSafe()
      pendingLayerUpdate = false
    })
  }
})
}

function doUpdateLayersSafe() {
  //console.log("更新图层 safely")
  // 1. 清除旧图层
  mountedLayers.value.forEach(layer => {
    if (mapInstance._animatingZoom) {
      //console.warn('正在动画中，延迟移除');
    } else {
      layer.off()
      //如果我在现在就直接_map=null，那么我切换地图就会报错
      //updatelayer是由于我的地图中心点发生了变化，地图中心点变化是因为我切换了currentBallId
      //currentballID带来重算
      //layer._map = null; // 断开与地图的连接（非公开 API，慎用）
      layer._renderer = null;
      mapInstance.removeLayer(layer);
      //console.log('成功移除')
    }
  })
  mountedLayers.value = []

  // 2. 添加新图层
  const newLayers = drawballmap.getlayerref(props.id).value
  if (Array.isArray(newLayers)) {
    newLayers.forEach(layer => {
      if (layer && typeof layer.addTo === 'function') {
        layer.addTo(mapInstance)
        mountedLayers.value.push(layer)
      }
    })
  }
  console.log("现在挂载的有",mountedLayers)
}

// 修改后的 watcher
watch(
  () => drawballmap.getlayerref(props.id),
  () => {
    if (!mapInstance) return
    if (isZooming) {
      pendingLayerUpdate = true
    } else {
      doUpdateLayersSafe()
    }
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
    initMap()
    setupPickingWatcher()
    setupCoordWatcher()
    setupupdateballscaling()
    setuprenowalmapstate()
    setupZoomLayerProtection()
    console.log("初始化的新地图",mapInstance)
})



</script>

<style scoped>
.map {
  height: 100%;
  width: 100%;
}
</style>