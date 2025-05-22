<template>
    <header class="top-menu">
        <span class="top-menu-word">城对CityPair</span>
    </header>
</template>
<script>
export default{
    name:'headPane',
}
</script>
<style scoped>
.top-menu{
  
font-weight: bold;
  background-color: #999; /* 灰色背景，和你之前喜欢的一致 */
  color: white;
  line-height: 60px;
  text-align: left;
  user-select: none; /* 防止选中文字 */
}
.top-menu-word {
  font-family: "SimSun", serif; /* 宋体 */
  font-size: 24px;
  padding: 0 20px;


}
</style>