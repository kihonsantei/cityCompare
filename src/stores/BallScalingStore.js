import { defineStore } from "pinia";
import { reactive} from 'vue';


export const useMapZoomStore = defineStore('mapZoom', () => {
  // zoomState: { [id]: { center: [lng, lat], zoom: number } }
  const zoomState = reactive({
    1:{
        zoomcenter:[116.405415,39.907741],
        scale:12
    },
    2:{
        zoomcenter:[121.47489,31.232838],
        scale:12
    }
  })

  // 更新指定id的缩放信息
  //这个函数基本只用来创建新zoom
  function updateZoom(id, zoomcenter, scale) {
    console.log("把",id,"的zoomcenter更新成",zoomcenter,"scale更新成",scale)
    if (!zoomState[id]) {
      zoomState[id] = { zoomcenter, scale }
    } else {
      zoomState[id].zoomcenter = zoomcenter
      zoomState[id].scale = scale
    }
  }

  // 删除指定id的缩放信息
  function deleteZoom(id) {
    if (zoomState[id]) {
      delete zoomState[id]
    }
  }

  function getZoomState(id){
     if (zoomState[id]) {
        return zoomState[id]
     }
     else{
        return null;
     }
  }

  return {
    zoomState,
    updateZoom,
    deleteZoom,
    getZoomState
  }
})