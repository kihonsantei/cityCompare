import { defineStore } from "pinia"
import {ref} from 'vue'
import { useMapZoomStore } from "./BallScalingStore"
import { ComponentListStore } from "./MapComponentStore"


export const MapListStore=defineStore('mapViews',()=>{
    const views = ref({
        1:{
            "name":'北京',
            "center":[116.405415,39.907741],
        },
        2:{
            "name":'上海',
            "center":[121.47489,31.232838],
        }
    })
    var IDcounter=3
    const mapzoomstate=useMapZoomStore()
    const componentliststore=ComponentListStore()
    
    //创建NewView必须走这里
    function createNewView(orginstatus,name="",center=[]){
        const nowID=IDcounter
        //如果未指定名称，名称就是新坐标球+nowID
        if (name.length<=0){
            name="新坐标球"+nowID}
        
        views.value[nowID]={
            "name":name,
            "center":center
        }
        //创建对应的zoom状态
        
        console.log("新坐标球的zoom是",orginstatus.zoom,"center是",orginstatus.center)
        mapzoomstate.updateZoom(nowID,orginstatus.center,orginstatus.zoom)
        //创建对应的style
        componentliststore.createNewStyle(nowID)

        IDcounter+=1
        //会返回创建的新View的ID
        return nowID
    }
    function deleteOldView(id) {
    if (views.value[id]) {
        delete views.value[id]
        mapzoomstate.deleteZoom(id)
        componentliststore.deleteStyle(id)
    } else {
        console.warn(`视图 ID ${id} 不存在，无法删除。`)
    }
    }
    return {
        views,
        createNewView,
        deleteOldView
    }

})
