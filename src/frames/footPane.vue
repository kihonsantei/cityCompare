<template>
    <footer class="footer-menu">
        <span class="footer-menu-word">版权所有 杨宗翰 yangzonghan24 @mails.ucas.ac.cn BiliBili <a href="https://space.bilibili.com/174911884">@奇策三定</a> 公众号 <a href="https://mp.weixin.qq.com/s/Fis-czNIu42RzktKnY_INw">@奇行策</a></span>
    </footer>
</template>
<script>
export default{
    name:'footPane',
}
</script>
<style scoped>
.footer-menu{
  background-color: #999; /* 灰色 */
  color: white;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

}
.footer-menu-word {
  font-weight: bold;
  font-size:12px;
  color: white;
  padding: 8px 20px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>