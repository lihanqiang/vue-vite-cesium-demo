import Cesium from '@/cesiumUtils/cesium'
import DrawSatelliteLines from './satelliteLines'
import ImportModel from '@/cesiumUtils/importModel'
import gerateSatelliteLines from '@/mocks/satellitePath'

export const setSatellite = (viewer) => {
  new DrawSatelliteLines(viewer, {
    lines: gerateSatelliteLines(0, 0)
  })
  new ImportModel(
    viewer,
    {
      uri: new URL(`../assets/models/Satellite.glb`, import.meta.url).href,
      position: [89, 0, 700000],
      conf: {
        id: 'sat',
        name: '卫星',
        text: '卫星',
        pixelOffset: new Cesium.Cartesian2(0, -50),
        scale: 200000
      }
    }
  )
}
