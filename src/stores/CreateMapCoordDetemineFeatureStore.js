import { defineStore } from "pinia"
import {ref} from 'vue'


export const CoordDetermine = defineStore('mapcoorddetermine', () => {
  const isPicking = ref(false)
  const pickedCoord = ref(null)
  const editball=ref("null")
  //储存着这次pick的类型
  const coordtype=ref("null")
  //开始拾取时
  function startPicking(noweditball,type) {
    console.log("CoordDetermine组件开始拾取")
    isPicking.value = true
    pickedCoord.value = null
    //把正在编辑的ball设置成noweditball
    editball.value=noweditball
    coordtype.value=type
  }

  function finishPicking(coord) {
    console.log("CoordDetermine组件结束拾取")
    pickedCoord.value = coord
    isPicking.value = false
    console.log(coord)
  }

  return {
    isPicking,
    pickedCoord,
    editball,
    coordtype,
    startPicking,
    finishPicking
  }
})