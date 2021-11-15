import Cesium from '@/cesiumUtils/cesium'

const entityIDs = []

const generatePoints = (count = 10, size = 10000, center = [111.0, 26.0]) => {
  return Array(count).fill('').map((any, i) => {
    return {
      pos: [center[0] + Math.random() * 5, center[1] + Math.random() * 5],
      id: `${Math.random()}`,
      size: Math.abs(Math.random() * size - size / 2)
    }
  })
}

export const setSpreadEllipse = (viewer) => {
  const max = 100000
  const points = generatePoints()
  points.forEach(async(item) => {
    setTimeout(() => {
      const color = Math.random() < 0.5 ? Cesium.Color.RED.withAlpha(0.5) : Cesium.Color.YELLOW.withAlpha(0.5)
      let r = item.size
      let r2 = item.size
      entityIDs.push(item.id)
      viewer.entities.add({
        id: item.id,
        name: 'Circle',
        position: Cesium.Cartesian3.fromDegrees(item.pos[0], item.pos[1], 0),
        ellipse: {
          semiMinorAxis: new Cesium.CallbackProperty(() => {
            if (r < max) {
              r += 1000
            } else {
              r = 0
            }
            return r
          }, false),
          semiMajorAxis: new Cesium.CallbackProperty(() => {
            if (r2 < max) {
              r2 += 1000
            } else {
              r2 = 0
            }
            return r2
          }, false),
          height: 0,
          material: color,
          outline: false
        }
      })
    }, Math.random() * 500)
  })
}

export const destroy = (viewer) => {
  if (entityIDs?.length) {
    entityIDs.forEach((entity) => {
      viewer.entities.removeById(entity)
    })
    entityIDs.length = 0
  }
}
