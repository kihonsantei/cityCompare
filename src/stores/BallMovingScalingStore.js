import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const BallMovingScalingStore = defineStore('ballZoom', () => {
  // 用 reactive 定义字典，两个key分别存状态
  // 单纯管理两个ball的缩放状态
  const zoomStates = reactive({
    left: { zoom: null, center: null },
    right: { zoom: null, center: null }
  })
    function setZoomState(id, zoom, center) {
    //console.log("更新状态")
    if (!zoomStates[id]) {
      // 防止传错id，简单创建一个空的
      zoomStates[id] = { zoom: null, center: null }
    }
    zoomStates[id].zoom = zoom
    zoomStates[id].center = center
    //console.log(zoomStates)
  }

  return {
    zoomStates,
    setZoomState
  }
})