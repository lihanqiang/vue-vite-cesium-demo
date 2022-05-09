import Cesium from '@/cesiumUtils/cesium'
import ImportModel from '@/cesiumUtils/importModel'

export const setStaticRadar = (viewer, id, name, position) => {
  new ImportModel(
    viewer,
    {
      uri: `/src/assets/models/radar_static.gltf`,
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
