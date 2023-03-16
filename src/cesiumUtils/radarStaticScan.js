import * as Cesium from 'cesium'
import { setStaticRadar } from '@/cesiumUtils/radarStatic'
import { $t } from './i18n'

export const setRadarStaticScan = (viewer, active) => {
  const lng = 110
  const lat = 34
  const d = 5
  if (!active) {
    viewer.entities.removeById('ellipsoid')
    viewer.entities.removeById('radar1')
    viewer.entities.removeById('radar2')
    viewer.entities.removeById('yuanzhu1')

    return
  }
  viewer.entities.add({
    id: 'ellipsoid',
    name: 'ellipsoid',
    position: Cesium.Cartesian3.fromDegrees(lng, lat, 340000),
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(lng, lat, 340000),
      new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(10),
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(0)
      )
    ),
    ellipsoid: {
      radii: new Cesium.Cartesian3(100000.0, 100000.0, 130000.0), //
      fill: false,
      outline: true,
      outlineWidth: 0.5,
      outlineColor: Cesium.Color.GRAY,
      slicePartitions: 24,
      stackPartitions: 36
    }
  })
  setStaticRadar(viewer, 'radar1', $t('radar 1'), [lng + d, lat, 0])
  setStaticRadar(viewer, 'radar2', $t('radar 2'), [lng - d, lat, 0])

  const radar1 = viewer.entities.getById('radar1')
  const radar2 = viewer.entities.getById('radar2')
  radar1.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(lng + d, lat, 0),
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(50),
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(0)
    )
  )
  radar2.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(lng - d, lat, 0),
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(230),
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(0)
    )
  )
}
