# vue-vite-cesium-demo
[CN 中文](./README.md) / [EN English](./README-EN.md)

本demo项目使用Vue.js（v3.0）、Vite、Cesium.js进行开发，解决了市面上没有这几个框架同时出现的痛点。本项目有大量现成的解决方案，可根据自己情况使用，在使用之前请阅读并遵循LICENSE协议。
## 项目包含一下功能
  -  1、生成大量节点；
  -  2、卫星与探测区域展示；
  -  3、可视域分析；
  -  4、通视度分析；
  -  5、加载geojson；
  -  6、地形展示；
  -  7、高危报警功能；
  -  8、地面雷达展示；
  -  9、地图动态通联展示；
  -  10、菲涅尔区展示；
  -  11、对空雷达区域展示；
  -  12、河流淹没；
  -  13、动态河流；
  -  14、追踪扫描；
  -  15、天气展示：雨、雪、雾；
  -  16、实时绘制飞机飞行轨迹（直飞、绕飞、盘旋）；
  -  17、接合rtsp视频推流软件，实现无人机侦察视频实时传输图像；
  -  18、扩散墙;
  -  19、白膜建筑;
  -  20、结合Echarts。
## 预览
<img src="https://i.ibb.co/yn50yz5/earth.jpg" width="50%" alt="preview" />

<img src="https://i.ibb.co/HFgPbFB/pushing.jpg" width="50%" alt="preview" />

<img src="https://i.ibb.co/x6KKxVn/jietu.png" width="50%" alt="preview" />

<img src="https://i.ibb.co/7SwqVKK/xxx.png" width="50%" alt="preview" />

<img src="https://i.ibb.co/yPCcMwp/yyy.png" width="50%" alt="preview" />

## 在线网站
[https://lihanqiang.github.io/vue-vite-cesium-demo/](https://lihanqiang.github.io/vue-vite-cesium-demo/)

## Demo结构
  - public
  - > geojson
  - > models
  - > plugins
  - > tilesets
  - > setting.js
  - src
  - > assets
  - > cesiumUtils
  - > components
  - > mocks
  - > styles
  - > App.vue
  - > main.js
### cesiumUtils:
请重点关注该文件夹，提供本demo的大量工具函数。
### 项目运行
使用npm（也可以使用yarn）进行项目依赖安装。进入项目根目录运行下列代码：
```bash
npm install or yarn
npm run dev or yarn run dev
```
运行: `npm run dev` 命令报下面类似错误, 在项目根目录执行命令: `node .\node_modules\esbuild\install.js`。
  ```bash
  Error: spawn H:\node_modules\esbuild\esbuild.exe ENOENT
    at Process.ChildProcess._handle.onexit (node:internal/child_process:282:19)
    at onErrorNT (node:internal/child_process:477:16)
  Emitted 'error' event on ChildProcess instance at:
    at Process.ChildProcess._handle.onexit (node:internal/child_process:288:12)
    at onErrorNT (node:internal/child_process:477:16)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
    errno: -4058,
    path: 'H:\node_modules\\esbuild\\esbuild.exe',
    spawnargs: [ '--service=0.12.9', '--ping' ]
  }
  ```
### RTSP项目运行说明
本项目使用开源的WEB RTSP视频推流方案，下载解压缩你在网络上下载的视频推流软件，按照说明安装和部署。关注```setting.js```进行协议端口配置。也可按照我的RTSP方案进行配置：

#### 下载
链接：https://pan.baidu.com/s/1Hovu2CRr8N7MOlKm1MsPNw?pwd=txvg

#### 安装
* 将文件解压后放置于`D:\rtsp`目录下:

<img src="https://i.ibb.co/0BFtJ1z/2023-03-16-135523.png" width="50%" alt="preview" />

* 首先安装`vc++lib_v2020.8.2.exe`。

#### 运行
* 以管理员身份打开`cmd`，进入`D:/rtsp/h5s-r10.8.0330.20-win64-release`目录。

* 先运行`regservice.bat`，再运行`h5ss.bat`。

* 点击`UAV detection (video streaming)`按钮，在界面左上角即可看到画面。

### 说明
本项目的代码，大部分为自创（70%以上），也有少部分代码借鉴他人，如有侵权问题，请联系删除。
### TIPS
.env.development以及.env.production文件为开发环境和生产环境的配置文件，这里的 `VITE_BUILD_PATH_PREFIX` 变量是本系统部署时（ https://lihanqiang.github.io/vue-vite-cesium-demo/ ），因为有 `/vue-vite-cesium-demo` 的缘故，需要在引用 `/public` 静态文件时，加上`/vue-vite-cesium-demo`前缀。

** 在一般情况下，你只需设置 `VITE_BUILD_PATH_PREFIX=''` ，完成后打包发布即可。**
