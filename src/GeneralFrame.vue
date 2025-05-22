<template>
  <div class="app-container">
    <headPane class="header" />
    <div class="noheader">
    <div class="main-content">
      <div class="left-center">
        <EarthPane :id="'left'"/>
        <EarthPane :id="'right'"/>
      </div>
      <footPane class="footer" />
    </div>
    <SettingPane class="sidebar" />
    </div>
  </div>
</template>

<script>
//import EarthPane from './components/EarthPane.vue'
import headPane from './frames/headPane.vue'
import footPane from './frames/footPane.vue'
import SettingPane from './core/SettingPane.vue';
import EarthPane from './core/EarthPane.vue';

export default {
  name: 'GeneralFrame',
  components: {
    headPane,
    footPane,
    SettingPane,
    EarthPane
  }
}


</script>
<style>
html,body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.app-container {
  display: flex;
  flex-direction:column;
  height: 100vh; 
  margin: 0;
  padding: 0;
  /* 防止横向滚动 */
  box-sizing: border-box;
  /*控制元素的盒模型计算方式*/
  /*在border-box模式下,元素的 width 和 height 包含 内容、内边距、边框*/
}

/* 顶部固定导航 */
.header {
  
  height: 60px;
  width: 100vw;
  top: 0; left: 0; right: 0;
}

.noheader{
  display: flex;
  flex-direction: row;
  flex:1;
  
}

/* 主内容区，下方填充顶部导航高度 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction:column;
  padding-top:0px; /* 避开固定头部 */
  box-sizing: border-box;
}

/* 左侧和中间区域容器，两个 EarthPane 并排 */
.left-center {
  flex: 1;
  display: flex;
  gap:10px;
}

/* 每个 EarthPane 占一半宽，黄色背景 */
.left-center > * {
  flex: 1;
  background-color: #ffeb3b; /* 黄色 */
  padding: 10px;
  box-sizing: border-box;
}
/* 底部页脚 */
.footer {
  display: flex;
  box-sizing: border-box;
  height: 50px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 右侧绿色侧栏固定宽度 */
.sidebar {
  width:350px;
  box-sizing: border-box;
  border: 2px solid black;
}



</style>
