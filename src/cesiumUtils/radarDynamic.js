import Cesium from '@/cesiumUtils/cesium'
import ImportModel from '@/cesiumUtils/importModel'

export const setRadarDynamic = (viewer, id, name, position) => {
  new ImportModel(
    viewer,
    {
      uri: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/radar_dynamic.glb`,
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
