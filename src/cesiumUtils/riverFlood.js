import Cesium from '@/cesiumUtils/cesium'

export const setRiverFlood = (viewer, active) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110.1, 32, 10000),
      duration: 1.6
    })
    let waterH = 270
    let x = 1
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.entities.add({
      id: 'riverFlood',
      name: 'riverFlood',
      position: Cesium.Cartesian3.fromDegrees(110.1, 32),
      ellipse: {
        semiMinorAxis: 10000,
        semiMajorAxis: 10000,
        height: 0,
        extrudedHeight: new Cesium.CallbackProperty(() => {
          waterH += 0.15 * x
          if (waterH > 310) {
            x = -1
          }
          if (waterH < 270) {
            x = 1
          }
          return waterH
        }, false), // 多边形凸出面高度
        material: Cesium.Color.BLUE.withAlpha(0.3)
      }
    })
  } else {
    viewer.entities.removeById('riverFlood')
  }
}
