import * as Cesium from 'cesium'
import img from '@/assets/blue12.png'

export const setEmitter = (viewer, active) => {
  if (!active) {
    viewer.entities.removeById('radarScanS1')
    viewer.entities.removeById('radarScanS2')
    return
  }
  viewer.entities.add({
    id: 'radarScanS1',
    name: 'radarScanS1',
    position: Cesium.Cartesian3.fromDegrees(110.8, 33.8, 290000),
    cylinder: {
      length: 600000.0,
      topRadius: 50000,
      bottomRadius: 150000,
      material: new Cesium.ImageMaterialProperty({
        image: img,
        color: Cesium.Color.WHITE.withAlpha(0.3),
        transparent: true
      })
    },
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(110.8, 33.8, 0),
      new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(-90),
        Cesium.Math.toRadians(-10),
        Cesium.Math.toRadians(120)
      )
    )
  })
  viewer.entities.add({
    id: 'radarScanS2',
    name: 'radarScanS2',
    position: Cesium.Cartesian3.fromDegrees(109.2, 34.2, 290000),
    cylinder: {
      length: 600000.0,
      topRadius: 50000,
      bottomRadius: 150000,
      material: new Cesium.ImageMaterialProperty({
        image: img,
        color: Cesium.Color.WHITE.withAlpha(0.3),
        transparent: true
      })
    },
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(109.2, 34.2, 0),
      new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(90),
        Cesium.Math.toRadians(-10),
        Cesium.Math.toRadians(120)
      )
    )
  })
}
