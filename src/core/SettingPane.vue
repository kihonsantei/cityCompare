<template>
  <div class="setting-pane">
    <!-- 显示情况 -->
    <section class="section">
      <h3 class="titler">显示情况</h3>
      <div class="container">
        <div class="left ball-show ">
          <div class="ball-show-floor1">
            <span>左球</span>
            <select class="input-box" ball="left" v-model="ballstate.currentleftid">
              <option value=0 viewid="0">空球</option>
              <option v-for="(view, viewid) in mapviewstore.views" :key="view.name" :value="viewid" :viewid="viewid">{{
                view.name }}</option>
            </select>
          </div>
          <button class="btn small align" ballid="left" @click="scaletosame($event)">比例到此</button>
        </div>
        <div class="right ball-show">
          <div class="ball-show-floor1">
            <span>右球</span>
            <select class="input-box" ball="right" v-model="ballstate.currentrightid">
              <option value=0 viewid="0">空球</option>
              <option v-for="(view, viewid) in mapviewstore.views" :key="view.name" :value="viewid" :viewid="viewid">{{
                view.name }}</option>
            </select>
          </div>
          <button class="btn small align" ballid="right" @click="scaletosame($event)">比例到此</button>
        </div>

      </div>

    </section>

    <!-- 编辑球体 -->
    <section class="section">
      <h3 class="titler">编辑</h3>
      <div class="row">
        <select class="input-box" id="editing-ball" v-model="noweditball">
          <option disabled value="" selected>请选择</option>
          <option value="left">左球</option>
          <option value="right">右球</option>
        </select>
        <button class="btn small ball-creation" @click="createNewBall">创建新球</button>
        <button class="btn small ball-creation" @click="deleteNowBall">删除本球</button>
      </div>
      <div v-if="currenteditid > 0">
        <div class="row">
          <label>名称</label>
          <input type="text" class="custom-input" v-model="currenteditview.name">
          <label>颜色</label>
          <input type="color" v-model="currenteditstyle.color">
        </div>
        <div class="row">
          <span>中心</span>
          <span v-if="currenteditview.center && currenteditview.center.length === 2">
            <span class="state">已确定</span>
            <button class="btn small" @click="handlePanto">缩放</button>
          </span>
          <span v-else-if="pickcenterstore.isPicking">
            <span class="state">正在拾取</span>
          </span>
          <span v-else>
            <span class="state">无中心</span>
            <button class="btn small" @click="handlePickClick">拾取</button>
          </span>
        </div>
        <div class="row">
          
          <label>创建图形</label>
          <div v-if="currenteditview.center && currenteditview.center.length === 2">
            <div v-if="!coorddetermine.isPicking" class="row">
              <input type="text" class="custom-input" v-model="tocreatename">
              <select class="input-box" id="feature-creation" v-model="tocreatetype">
                <option value="point" selected>点</option>
              </select>
              <button @click="createmapcoorddetemineFeature" class="btn small">开始创建</button>
            </div>
          <div v-else class="row">
            <span class="state">正在拾取</span>
          </div>
          </div>
          <div v-else class="row">
            <span>请先指定中心</span>
          </div>
        </div>
      </div>
      <div v-else class="row">
        <span>未选择有效视图</span>
      </div>
      <!-- 创建新图形 -->


      <!-- 图形表格 -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr class="table-head">
              <th>名称</th>
              <th>类型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paddedGeometry" :key="index">
              <td>
                <!--<input v-if="item.editable" v-model="item.name" />-->
                <input v-if="item.editable" :value="item.name"
                  @input="updateGeometryName(item._index, $event.target.value)" />
                <span v-else>{{ item.name || '' }}</span>
              </td>
              <td>{{ item.type || '' }}</td>
              <td>
                <button v-if="item.editable" class="delete-btn" @click="deleteItem(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 标尺 -->
      <div class="row">
        <label>标尺</label>
        <input class="input-box" />
      </div>
    </section>
  </div>


</template>

<script setup>
import { ref, watch, watchEffect, computed } from 'vue'
import { MapListStore } from '@/stores/MapListStroe'
import { ballstateStore } from '@/stores/ballstateStore'
import { pickCenterStore } from '@/stores/PickCenterStore'
import { BallMovingScalingStore } from '@/stores/BallMovingScalingStore'
import { useMapZoomStore } from '@/stores/BallScalingStore'
import { ComponentListStore } from '@/stores/MapComponentStore'
import { CoordDetermine } from '@/stores/CreateMapCoordDetemineFeatureStore'

const ballstate = ballstateStore()
const mapviewstore = MapListStore()
const pickcenterstore = pickCenterStore()
const ballmovingscalingstroe = BallMovingScalingStore()
const usemapzoomstroe = useMapZoomStore()
const componentliststore = ComponentListStore()
const coorddetermine = CoordDetermine()

//检测球的变化
watch(() => ballstate.currentleftid, (newVal, oldVal) => {
  console.log('ballstate.left从', oldVal, "变成", newVal)
}, { deep: true })
watch(() => ballstate.currentrightid, (newVal, oldVal) => {
  console.log('ballstate.right从', oldVal, "变成", newVal)
}, { deep: true })

//noweditball有三种格式,left,right和null
const noweditball = ref("null")

watch(() => noweditball, (newVal) => {
  console.log('noweditball 改变了', newVal.value)
}, { deep: true })

//现在editd的id要通过noweditball和ball自身的状态来获得
const currenteditid = ref(0)

//反正就是不管是没在编辑还是主球是空,体现在纸面上就是currenteditid=0
watchEffect(() => {
  if (noweditball.value == "left") {
    currenteditid.value = ballstate.currentleftid
  }
  else if (noweditball.value == "right") {
    currenteditid.value = ballstate.currentrightid
  }
  else {
    currenteditid.value = 0
  }
  console.log("更新currentid到" + currenteditid.value)
})

const currenteditview = ref("null")

watch(currenteditid, (newVal) => {
  if (newVal == 0) {
    //如果是0怎么处理d
    currenteditview.value = {
    }
  }
  else {
    currenteditview.value = mapviewstore.views[newVal]
  }
})



const currenteditstyle = ref("null")
watch(currenteditid, (newVal) => {
  if (newVal == 0) {
    //如果是0怎么处理
    currenteditstyle.value = {
    }
  }
  else {
    currenteditstyle.value = componentliststore.style[newVal]
  }
})

//创建新球的函数

//在ball中实际上需要监听这里的currerntleft/rightfiled
//如果是创建球，ball对应的id会变成新id
//首先把当前的球的坐标传过去，然后球再建立从里边拉取坐标的关系
//如果是删除球，ball对应的id会变成0

function createNewBall() {
  if (noweditball.value == "left") {
    const orginstatus = ballmovingscalingstroe.zoomStates['left']
    console.log("orginstatus是", orginstatus)
    const creatednewID = mapviewstore.createNewView(orginstatus);
    console.log("新创建的ID是", creatednewID)
    //这里涉及到手动把currentid更改的问题
    ballstate.currentleftid = creatednewID
  }
  else if (noweditball.value == "right") {
    const orginstatus = ballmovingscalingstroe.zoomStates['right']
    const creatednewID = mapviewstore.createNewView(orginstatus);
    console.log("新创建的ID是", creatednewID)
    ballstate.currentrightid = creatednewID
  }
}

function deleteNowBall() {
  if (noweditball.value == "left") {
    const todelid = ballstate.currentleftid
    ballstate.currentleftid = 0
    mapviewstore.deleteOldView(todelid)
    console.log("删除的ID是", todelid)
  }
  else if (noweditball.value == "right") {
    const todelid = ballstate.currentrightid
    ballstate.currentrightid = 0
    mapviewstore.deleteOldView(todelid)
    console.log("删除的ID是", todelid)

  }


}

function handlePickClick() {
  //noeditball有left right和null三种类型，每个球收到之后看看符不符合自己吧
  pickcenterstore.startPicking(noweditball.value)
}

//结束拾取的话，就把这个坐标加上
watch(
  () => pickcenterstore.isPicking, // 
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      currenteditview.value.center = pickcenterstore.pickedCoord
      console.log("控制区已设定中心坐标")
      console.log("现在的mapview是", mapviewstore)
    }
  }
)

function handlePanto() {
  const getcenter = mapviewstore.views[currenteditid.value].center;
  usemapzoomstroe.updateZoom(currenteditid.value, getcenter, usemapzoomstroe.zoomState[currenteditid.value].scale)
}

function scaletosame(event) {
  const buttonEl = event.currentTarget
  const ballid = buttonEl.getAttribute("ballid")
  //nowmapid是这个ball现在对应的id
  const nowmapid = ballstate.getcurrentid(ballid)
  //我们要拿着这个id去找对应的scale
  //如果这是个有效的id
  if (usemapzoomstroe.getZoomState(nowmapid)) {
    const getscale = usemapzoomstroe.getZoomState(nowmapid).scale
    if (usemapzoomstroe.getZoomState(ballstate.currentleftid)) {
      usemapzoomstroe.updateZoom(ballstate.currentleftid, usemapzoomstroe.zoomState[ballstate.currentleftid].zoomcenter, getscale)
    }
    if (usemapzoomstroe.getZoomState(ballstate.currentrightid)) {
      usemapzoomstroe.updateZoom(ballstate.currentrightid, usemapzoomstroe.zoomState[ballstate.currentrightid].zoomcenter, getscale)
    }

  }
}
//import { storeToRefs } from 'pinia'

//const { style } = storeToRefs(componentliststore)

const geometry = computed(() => {
  return componentliststore.getStyle(currenteditid.value)?.geometry || []
})

/*
const paddedGeometry = computed(() => {
  // 把 geometry 中的每个对象复制一份，并加上 editable: true
  const real = geometry.value.map(g => ({ ...g, editable: true }))
  // 不足 5 行时补充空白行，editable: false 表示空行不可编辑
  const pad = Array.from({ length: Math.max(0, 5 - real.length) }, () => ({
    name: '',
    type: '',
    editable: false
  }))
  return [...real, ...pad]
})
*/
const paddedGeometry = computed(() => {
  const real = geometry.value.map((g, i) => ({
    ...g,
    editable: true,
    _index: i
  }))
  const pad = Array.from({ length: Math.max(0, 5 - real.length) }, () => ({
    name: '',
    type: '',
    editable: false
  }))
  return [...real, ...pad]
})
function updateGeometryName(index, val) {
  const style = componentliststore.getStyle(currenteditid.value)
  if (style && style.geometry[index]) {
    style.geometry[index].name = val
  }
}

function deleteItem(index) {
  const style = componentliststore.getStyle(currenteditid.value)
  if (!style) return
  const list = style.geometry
  if (list && index >= 0 && index < list.length) {
    list.splice(index, 1)
  }
}

const tocreatetype = ref("point")
const tocreatename = ref("新地")
function createmapcoorddetemineFeature() {
  coorddetermine.startPicking(noweditball.value, tocreatetype.value)
}

//拾取结束后
watch(
  () => coorddetermine.isPicking, // 
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      const geom = {
        "name": tocreatename.value,
        "type": tocreatetype.value,
        "dist": coorddetermine.pickedCoord["distance"],
        "direction": coorddetermine.pickedCoord["bearing"]
      }
      componentliststore.addGeometryToStyle(currenteditid.value, geom)
      tocreatename.value = "新地"
      //console.log("把", coorddetermine.pickedCoord, "上传给", currenteditid.value)
    }
  }
)

//下面的代码对Style进行监听

//性能问题先摆到一边
//先修改列表，后矫正视图
//这种应该取消一次重绘，就是说如果是创建或者删除的
//我们先不管他
/*
watch(
  () => componentliststore.style,
  (newVal, oldVal) => {
    const added = []
    const deleted = []
    const updated = []

    const newKeys = Object.keys(newVal || {})
    const oldKeys = Object.keys(oldVal || {})

    console.log("newKeys",newKeys,"oldKeys",oldKeys)
    console.log(newVal,oldVal)
    // 新增的 key
    newKeys.forEach(key => {
      if (!oldKeys.includes(key)) {
        added.push(key)
      }
    })

    // 删除的 key
    oldKeys.forEach(key => {
      if (!newKeys.includes(key)) {
        deleted.push(key)
      }
    })

    // 修改的 key
    newKeys.forEach(key => {
      if (oldKeys.includes(key)) {
        if (JSON.stringify(newVal[key]) !== JSON.stringify(oldVal[key])) {
          updated.push(key)
        }
      }
    })

    console.log('新增 keys:', added)
    console.log('删除 keys:', deleted)
    console.log('修改 keys:', updated)
  },
  {
    immediate: true,
    deep: true
  }
)
*/


</script>

<style scoped>
.titler {
  margin: 10px;
}

.setting-pane {
  padding: 10px;
  background-color: #f9f9f9;
  font-family: '宋体', serif;
  border: 1px solid #000;
}

.section {
  border-bottom: 1px solid #000;
  margin-bottom: 10px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.container {
  display: flex;
  /* 两个 leftball 横向排列 */
  justify-content: space-between;
  /* 左右分开 */
  gap: 1px;
  /* 两个盒子间距 */
}


.ball-show {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  padding: 10px;
  width: 45%;
  /* 两个盒子各占宽度 */
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
}

.ball-show-floor1 {
  align-items: center;
  display: flex;
  margin-bottom: 8px;

}

.input-box {
  width: 20px;
  /* select 占满剩余空间 */
  margin-left: 8px;
}

.align {
  width: 80%;

}

.btn {
  padding: 6px;
  cursor: pointer;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.input-box {
  width: 60px;
  height: 24px;
  background-color: #4a90e2;
  border: none;
  color: white;
}

.btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
}

.btn.small {
  padding: 4px 6px;
  font-size: 12px;
}

.custom-input {
  border: none;
  border-bottom: 1px solid #aaa;
  background: transparent;
  padding: 4px 0;
  font-size: 14px;
  width: 100px;
  color: #333;
  outline: none;
  transition: border-color 0.3s;
}

.custom-input:focus {
  border-bottom: 1px solid #4a90e2;
  /* 聚焦变色 */
}


.state {
  font-family: "黑体", "SimHei", "Microsoft YaHei";
  font-size: 14px;
  display: inline-flex;
  /* 或 flex，如果是 block 元素 */
  align-items: center;
  /* 垂直居中 */
  padding: 0 10px;
}

/*表格样式*/
.table-wrapper {
  max-height: 300px;
  /* 根据需要调整最大高度 */
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 保持表格宽度自适应容器 */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-family: "微软雅黑", Arial, sans-serif;
  color: #333;
}

/* 表头样式 */
.data-table thead tr.table-head {
  background-color: #4a90e2;
  /* 统一主色 */
  color: white;
  font-weight: bold;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table thead tr.table-head th {
  text-align: center;
  padding: 12px 8px;
  /* 稍微加大点内边距 */
  border-bottom: 2px solid #3a78c2;
  /* 深一点的分割线 */
  background-clip: padding-box;
  /* 防止边框透出 */
}

/* 单元格样式 */
.data-table th,
.data-table td {
  border: none;
  height: 42px;
  /* 微调高度 */
  padding: 8px 12px;
  /* 左右间距统一 */
  text-align: center;
  vertical-align: middle;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: background-color 0.3s;
}

.data-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.data-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

/* 调整列宽 */
.data-table th:nth-child(1),
.data-table td:nth-child(1) {
  width: 35%;
  text-align: left;
  /* 名称左对齐 */
  padding-left: 16px;
}

.data-table th:nth-child(2),
.data-table td:nth-child(2) {
  width: 45%;
}

.data-table th:nth-child(3),
.data-table td:nth-child(3) {
  width: 120px;
  /* 固定宽度，确保删除按钮不被遮挡 */
  text-align: center;
  padding-right: 12px;
  white-space: nowrap;
}

/* 输入框样式 - 统一和其他输入框风格 */
.data-table input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 2px solid #4a90e2;
  padding: 6px 4px;
  font-size: 14px;
  color: #333;
  background: transparent;
  transition: border-color 0.3s, background-color 0.3s;
  outline: none;
}

.data-table input:focus {
  border-bottom-color: #2c6cdf;
  background-color: #eaf4ff;
  /* 聚焦时浅蓝底 */
}

/* 删除按钮样式 */
.delete-btn {
  cursor: pointer;
  line-height: 1;
  display: inline-block;
  padding: 6px 14px;
  /* 和按钮padding对应 */
  font-size: 14px;
  background-color: #999;
  /* 红色警告 */
  color: white;
  border: none;
  border-radius: 3px;
  user-select: none;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>