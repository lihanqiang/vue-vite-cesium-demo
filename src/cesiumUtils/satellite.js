import Cesium from '@/cesiumUtils/cesium'
import DrawSatelliteLines from './satelliteLines'
import ImportModel from '@/cesiumUtils/importModel'
import gerateSatelliteLines from '@/mocks/satellitePath'
import { $t } from './i18n'

export const setSatellite = (viewer) => {
  new DrawSatelliteLines(viewer, {
    lines: gerateSatelliteLines(0, 0)
  })
  new ImportModel(
    viewer,
    {
      uri: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/models/Satellite.glb`,
      position: [89, 0, 700000],
      conf: {
        id: 'sat',
        name: $t('satellite'),
        text: $t('satellite'),
        pixelOffset: new Cesium.Cartesian2(0, -50),
        scale: 200000
      }
    }
  )
}
