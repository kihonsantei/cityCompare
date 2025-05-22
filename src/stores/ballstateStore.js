import { defineStore } from "pinia"
import {ref} from 'vue'


export const ballstateStore = defineStore('ball', () => {
  const currentleftid = ref(0)  // 初始绑定到0
  const currentrightid = ref(0) // 初始绑定到0
  //左球的状态
    // currentLeftName和rightname都能切换到对应的name
    //console.log(left.value)
  function getcurrentid(id){
    if (id=="left"){
      return currentleftid.value;
    }
    else if (id=="right"){
      return currentrightid.value;
    }
    else{
      return null;
    }

  }
  return {
    currentleftid,
    currentrightid,
    getcurrentid
  }
})