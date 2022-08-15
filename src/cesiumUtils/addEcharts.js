import option from './echartData.js' // 飞机航线
import Cesium from '@/cesiumUtils/cesium'
import { EchartsLayer } from './cesium_echartsLayer.js'

let layer
export const addEcharts = (viewer, active) => {
  if (active) {
    if (!layer) {
      layer = new EchartsLayer(viewer, option)
    }
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 10000000.0)
    })
  } else if (layer) {
    layer.destroy()
    layer = null
  }
}
