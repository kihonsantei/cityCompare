import { defineStore } from "pinia"
import {ref} from 'vue'


export const pickCenterStore = defineStore('mapCenterDetermine', () => {
  const isPicking = ref(false)
  const pickedCoord = ref(null)
  const editball=ref("null")
  //开始拾取时
  function startPicking(noweditball) {
    console.log("Pickcenter组件开始拾取")
    isPicking.value = true
    pickedCoord.value = null
    //把正在编辑的ball设置成noweditball
    editball.value=noweditball
  }

  function finishPicking(coord) {
    console.log("Pickcenter组件结束拾取")
    pickedCoord.value = coord
    isPicking.value = false
    console.log(coord)
  }

  return {
    isPicking,
    pickedCoord,
    editball,
    startPicking,
    finishPicking
  }
})