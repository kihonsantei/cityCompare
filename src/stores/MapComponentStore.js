import { defineStore } from "pinia"
import { computed, ref, watch, shallowRef } from 'vue'

export const ComponentListStore = defineStore('mapComponent', () => {
    const style = ref({
        1: {
            "color": "#66CCFF",
            "show": true,
            "geometry": [
                {
                    "name": "测试点1",
                    "type": "point",
                    "dist": 500,
                    "direction": 30
                },
            ]
        },
        2: {
            "color": "#DDBBFF",
            "show": true,
            "geometry": [
                {
                    "name": "测试点2",
                    "type": "point",
                    "dist": 1000,
                    "direction": 45
                }
            ]
        }
    })

    function createNewStyle(id, color = '#CCCCCC') {
        if (!style.value[id]) {
            style.value[id] = {
                color,
                show: true,
                geometry: [],
            }
        } else {
            console.warn(`ID ${id} 已存在，未覆盖。`)
        }
    }
    function deleteStyle(id) {
        if (style.value[id]) {
            delete style.value[id]
        } else {
            console.warn(`ID ${id} 不存在，无法删除。`)
        }
    }
    function getStyle(id) {
        const result = style.value[id]
        if (result) {
            return result
        } else {
            //如果没有就返回个空的
            console.warn(`ID ${id} 不存在。`)
            return {}
        }
    }
    function addGeometryToStyle(id, geometryItem) {
        if (style.value[id]) {
            style.value[id].geometry.push(geometryItem)
        } else {
            console.warn(`ID ${id} 不存在，无法添加 geometry。`)
        }
        console.log("添加过，当前的style如下", style)
    }
    function getAllStyleKeys() {
        return Object.keys(style.value)
    }
    return {
        style,
        createNewStyle,
        deleteStyle,
        getStyle,
        addGeometryToStyle,
        getAllStyleKeys
    }

}
)

// 主要负责计算出对应的LeafletMap图层
// 绘制逻辑：获取ref对应的id
// 首先绘制所有中心点
// 如果是空球，就根据标准的绘制(需要获取所有的中心点，没有中心点也就意味着不会有component，可以直接跳过)
// 生成球的图层
// 如果不是空球，从主要的读取中心点，开始遍历绘制
// 生成球的图层

//监听 如果任何一个refid变了都要全部重绘
//监听 如果style变了只需要获取对应id的重绘
//更新 重绘后记录到事件，在球图层中监听这个事件，如果发生变化就更新球

//不管了，监听球切换和style更换，只要有变换我就重绘
import { ballstateStore } from "./ballstateStore"
import { MapListStore } from "./MapListStroe"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { computeSymmetricPoint } from "@/tools/coord_polar"


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
})

function createLabeledMarker(lat, lng, color, label) {
    const icon = L.divIcon({
        className: 'labeled-marker-icon',
        html: `
      <div style="position: relative; display: flex; align-items: center;">
        <div style="
          width: 12px;
          height: 12px;
          background-color: ${color};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
          margin-right: 4px;
        "></div>
        <div style="
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
          color: black;
          border: 1px solid #ccc;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
          white-space: nowrap;
        ">
          ${label}
        </div>
      </div>
    `,
        iconSize: null,
        iconAnchor: [0, 12], // 圆点底部对准坐标
    });

    return L.marker([lat, lng], { icon });
}


export const DrawBallMap = defineStore("DrawBallMap", () => {

    const ballstate = ballstateStore()
    const mapliststore = MapListStore()
    const componentliststore = ComponentListStore()
    //leftid对应的中心
    const leftBallCenter = computed(() => {
        const id = ballstate.getcurrentid("left")
        if (!id || !mapliststore.views[id]) return []
        return mapliststore.views[id].center
    })
    const rightBallCenter = computed(() => {
        const id = ballstate.getcurrentid("right")
        if (!id || !mapliststore.views[id]) return []

        return mapliststore.views[id].center
    })
    const drawedlayerleft = shallowRef([])
    const drawedlayerright = shallowRef([])

    function getlayerref(side) {
        if (side == "left") {
            return drawedlayerleft
        }
        else if (side == "right") {
            return drawedlayerright
        }
    }

    function updatelayer(side) {
        //绘制中心
        var geomlist = [];
        let center = null
        let id = null
        if (side == "left") {
            center = leftBallCenter.value
            id = ballstate.getcurrentid("left")
        }
        else if (side == "right") {
            center = rightBallCenter.value
            id = ballstate.getcurrentid("right")
        }
        //如果id是空的先什么都不绘制，否则绘制
        if (id <= 0) {
            console.log("woc")
                        if (side == "left") {
              drawedlayerleft.value=[]
            }
            else if (side == "right") {
              drawedlayerright.value =[]  
            }
        }
        else {
            if (center && Array.isArray(center) && center.length === 2) {
                //获取颜色
                const marker = createLabeledMarker(center[1], center[0], componentliststore.getStyle(id).color, mapliststore.views[id].name)
                geomlist.push(marker)
            
            const idlist=componentliststore.getAllStyleKeys()
            console.log("有这些key",idlist)
            const centerPoint={
                latitude: center[1],   // 纬度
                longitude: center[0]   // 经度
                }
             for (const id in idlist){
                const styleObj = componentliststore.getStyle(id)
                const geometry = styleObj.geometry || []
                const color = styleObj.color || '#3388ff'
                const markerList = []
                for (const geo of geometry) {
                    if (geo.type === 'point'){
                        const { dist, direction, name } = geo
                        const point = computeSymmetricPoint(centerPoint, dist, direction)
                        const marker = createLabeledMarker(point.latitude,point.longitude,color,name)
                        console.log("创建点",name)
                        markerList.push(marker)
                    }
                }
                if (markerList.length > 0) {
                    const layerGroup = L.layerGroup(markerList)
                    geomlist.push(layerGroup)}
                }
            //创建一个图层，以id标识
        
                //获取其颜色
                //获取其是否可见
                //如果可见,循环geometry
                    //反算其坐标，绘制，加入
            
            if (side == "left") {
                drawedlayerleft.value = geomlist
                //drawedlayerleft.value.splice(0, drawedlayerleft.value.length, ...geomlist)
                console.log("更新左侧drawedlayerleft", drawedlayerleft)
            }
            else if (side == "right") {
                drawedlayerright.value = geomlist
                //drawedlayerright.value.splice(0, drawedlayerright.value.length, ...geomlist)
            }
            }
            else{
            if (side == "left") {
              drawedlayerleft.value=[]
            }
            else if (side == "right") {
              drawedlayerright.value =[]  
            }
            }
        }
    }
    //watch ballcenter或者style,只要变动就重新绘制
    watch(
        [
            () => leftBallCenter.value,
            () => rightBallCenter.value,
            () => componentliststore.style,
        ],
        () => {
            console.log("update layer")
            //console.log("左侧全局图层",drawedlayerleft)
            //console.log("右侧全局图层",drawedlayerright)
            updatelayer('left')
            updatelayer('right')
        },
        {
            deep: true,
            immediate: true
        }
    )

    //在map里增加相应的监听环节，如果变化就重新挂载
    return {
        getlayerref,
        updatelayer,
    }

}


)