import Cesium from '@/cesiumUtils/cesium'
import ImportModel from '@/cesiumUtils/importModel'

export const setRadarDynamic = (viewer, id, name, position) => {
  new ImportModel(
    viewer,
    {
      uri: new URL('../../../public/models/radar_dynamic.glb', import.meta.url).href,
      position,
      conf: {
        id,
        name,
        text: name,
        pixelOffset: new Cesium.Cartesian2(0, 50),
        scale: 100
      }
    }
  )
}
