// * 通视分析
import Cesium from '@/cesiumUtils/cesium'

const visionLinesArr = []

// 绘制线
function drawLine(viewer, startPos, endPos, color = Cesium.Color.GREEN) {
  visionLinesArr.push(viewer.entities.add({
    polyline: {
      positions: [startPos, endPos],
      width: 2,
      material: color,
      depthFailMaterial: color
    }
  }))
}

/**
 * 进行通视分析
 * @param {Object} viewer viwer
 * @param {Array<Cartesian3, Cartesian3>} positions 起点 终点的位置数组
 */
export function analysisVisible(viewer, poss) {
  const positions = [Cesium.Cartesian3.fromDegrees(...poss[0]), Cesium.Cartesian3.fromDegrees(...poss[1])]
  // 计算射线的方向
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      positions[1],
      positions[0],
      new Cesium.Cartesian3()
    ),
    new Cesium.Cartesian3()
  )
  // 建立射线
  const ray = new Cesium.Ray(positions[0], direction)
  const result = viewer.scene.globe.pick(ray, viewer.scene) // 计算交互点，返回第一个
  if (result !== undefined && result !== null) {
    drawLine(viewer, result, positions[0], Cesium.Color.GREEN) // 可视区域
    drawLine(viewer, result, positions[1], Cesium.Color.RED) // 不可视区域
  } else {
    drawLine(viewer, positions[0], positions[1], Cesium.Color.GREEN)
  }
}

export function clearLine(viewer) {
  if (visionLinesArr.length) {
    visionLinesArr.forEach((entity) => {
      viewer.entities.remove(entity)
    })
  }
}

