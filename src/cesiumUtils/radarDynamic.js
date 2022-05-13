import Cesium from '@/cesiumUtils/cesium'
import ImportModel from '@/cesiumUtils/importModel'
import { pathPrefix } from '@/cesiumUtils/pathPrefix'

export const setRadarDynamic = (viewer, id, name, position) => {
  new ImportModel(
    viewer,
    {
      uri: `${pathPrefix}/models/radar_dynamic.glb`,
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
