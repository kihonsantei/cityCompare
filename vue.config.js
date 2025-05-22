const { defineConfig } = require('@vue/cli-service')

const path = require("path");
const webpack = require("webpack");
//const CopyWebpackPlugin = require("copy-webpack-plugin");

// 添加cesium模块路径
//const cesiumSource = "./node_modules/cesium/Source";
//const cesiumBuild = './node_modules/cesium/Build/Cesium';

module.exports = defineConfig({
  transpileDependencies: true,

  // Webpack配置项
  configureWebpack : {

    output: {
      // 解决cesium的多行字符串问题
      sourcePrefix: ''
    },
    entry:"./src/main.js",
    amd: {        
      // 启用webpack对cesium格式友好，也就是不再对cesium进行格式的严格检查
      toUrlUndefined: true
    },
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        "@": path.resolve("src"),
        components: path.resolve("src/components"),
        assets: path.resolve("src/assets"),
        views: path.resolve("src/views"),
        //cesium: path.resolve(__dirname, cesiumSource),
      },
      fallback:{
        //url库
        "url": require.resolve("url/"),
        //zlib相关库
        "zlib": require.resolve("browserify-zlib"),
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        //stream
        "stream": require.resolve("stream-browserify"),
        //https
        "https": require.resolve("https-browserify"),
        //http
        "http": require.resolve("stream-http")
      }
    },
    plugins: [/*
      // 添加Cesium的三个静态文件的文件夹到plugins：Assets, Widgets, Workers
      new CopyWebpackPlugin({
        patterns: [
            { from: path.join(cesiumBuild, 'Workers'),to: 'Workers' }
          ],
      }),
      new CopyWebpackPlugin({
          patterns: [
              { from: path.join(cesiumSource, 'Assets'),to: 'Assets' }
          ],
      }),
      new CopyWebpackPlugin({
          patterns: [
              { from: path.join(cesiumSource, 'Widgets'),to: 'Widgets' }
          ],
      }),
      new webpack.DefinePlugin({
          // Define relative base path in cesium for loading assets
          CESIUM_BASE_URL: JSON.stringify('')
      })*/
    ],
  }
})
