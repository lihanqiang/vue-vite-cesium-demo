import Cesium from '@/cesiumUtils/cesium'

// const addTileMapProvider = (viewer) => {
//   const imageryViewModels = []
//   imageryViewModels.push(
//     new Cesium.ProviderViewModel({
//       name: '谷歌地图_COBALT',
//       iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/blueMarble.png'),
//       tooltip: '来源于谷歌COBALT地图',
//       creationFunction() {
//         return new Cesium.UrlTemplateImageryProvider({
//           url: window.setting.geoServerBaseUrl
//         })
//       }
//     })
//   )
//   new Cesium.BaseLayerPicker('baseLayerPickerContainer', {
//     globe: viewer.scene.globe,
//     imageryProviderViewModels: imageryViewModels
//   })
// }

export const initCesium = (viewerName = '3d') => {
  // 设置在中国
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(80, 22, 130, 50)
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTQxMGIzNC04N2M0LTQ0MDUtOTdlYi02ZGE0NTgyZGVjMzAiLCJpZCI6MzA5ODUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTQ2OTQ5NzN9.JbUqIgKO92noy6B8zcYMdq8QygnMKM70RIdJZqAwwdk'
  // const url = '/geoserver' // Geoserver URL
  // const terrainUrl = '/terrain' // Terrain URL
  const is3D = viewerName === '3d'
  const containerName = is3D ? 'cesiumContainer' : 'cesiumContainer2D'
  const baseConf = {
    // imageryProvider: false,
    geocoder: false,
    navigationHelpButton: false,
    // 去掉框选
    selectionIndicator: false,
    baseLayerPicker: false,
    showRenderLoopErrors: false
  }
  const extendConf = {}
  const viewer = new Cesium.Viewer(containerName, { ...baseConf, ...extendConf })
  // 加载Cesium 官网的地形，亦可以加载自己的地形
  const terrainLayer = new Cesium.CesiumTerrainProvider({
    url: Cesium.IonResource.fromAssetId(1),
    requestWaterMask: true,
    requestVertexNormals: true
  })
  viewer.scene.terrainProvider = terrainLayer
  viewer.scene.globe.enableLighting = true
  viewer.imageryLayers.addImageryProvider(
    new Cesium.IonImageryProvider({ assetId: 3 })
  )
  // addTileMapProvider(viewer)
  viewer.camera.setView({
    // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
    // fromDegrees()方法，将经纬度和高程转换为世界坐标
    destination: Cesium.Cartesian3.fromDegrees(...[104, 30, 10000000]),
    orientation: {
      // 指向
      heading: Cesium.Math.toRadians(0, 0),
      // 视角
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  })
  viewer.clock.shouldAnimate = true
  return viewer
}
