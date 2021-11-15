import * as Cesium from 'cesium'
import { setStaticRadar } from '@/cesiumUtils/radarStatic'

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
        Cesium.Math.toRadians(10), // 以地平面为基准旋转
        Cesium.Math.toRadians(0), // 空中旋转
        Cesium.Math.toRadians(0) // 空中翻滚
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
  setStaticRadar(viewer, 'radar1', '雷达1', [lng + d, lat, 0])
  setStaticRadar(viewer, 'radar2', '雷达2', [lng - d, lat, 0])

  // let ellipsoid = viewer.entities.getById('ellipsoid')
  // console.log(ellipsoid.position.getValue(Cesium.JulianDate.now()))

  const radar1 = viewer.entities.getById('radar1')
  const radar2 = viewer.entities.getById('radar2')
  radar1.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(lng + d, lat, 0),
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(50), // 以地平面为基准旋转
      Cesium.Math.toRadians(0), // 空中旋转
      Cesium.Math.toRadians(0) // 空中翻滚
    )
  )
  radar2.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(lng - d, lat, 0),
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(230), // 以地平面为基准旋转
      Cesium.Math.toRadians(0), // 空中旋转
      Cesium.Math.toRadians(0) // 空中翻滚
    )
  )
}
