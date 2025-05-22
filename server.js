const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 静态资源托管 dist 目录
app.use(express.static(path.join(__dirname, 'dist')))

// 处理 SPA 路由，所有非静态请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})