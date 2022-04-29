/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
import Cesium from '@/cesiumUtils/cesium'

let wall

export function WallRegularDiffuse(options) {
  const _viewer = options.viewer
  // wall center
  const _center = options.center
  // wall radius
  const _radius = options.radius || 1000.0
  // wall edges
  const _edge = options.edge || 64
  // wall spread speed
  const _speed = options.speed || 5.0
  // wall spread height
  const _height = options.height || 100.0
  // current height
  let _currentHeight = _height
  // min radius
  const _minRadius = options.minRadius || 10
  // current radius
  let _currentRadius = _minRadius

  if (_edge < 3) {
    return false
  }

  /**
   * @description: getPositions
   * @param {*} _center: center
   * @param {*} _edge: edge
   * @param {*} _currentRadius: currentRadius
   * @param {*} _currentHeight: currentHeight
   * @return {*}
   */
  function _getPositions(_center, _edge, _currentRadius, _currentHeight) {
    const positions = []
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(_center[0], _center[1], 0)
    )
    for (let i = 0; i < _edge; i++) {
      const angle = (i / _edge) * Cesium.Math.TWO_PI
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      const point = new Cesium.Cartesian3(
        x * _currentRadius,
        y * _currentRadius,
        _currentHeight
      )
      positions.push(Cesium.Matrix4.multiplyByPoint(modelMatrix, point, new Cesium.Cartesian3()))
    }
    // 封闭墙，首节点点需要存两次
    positions.push(positions[0])
    return positions
  }

  // add polygon
  wall = _viewer.entities.add({
    wall: {
      positions: new Cesium.CallbackProperty(() => {
        let positions = []
        _currentRadius += (_radius * _speed) / 1000.0
        _currentHeight -= (_height * _speed) / 1000.0

        if (_currentRadius > _radius || _currentHeight < 0) {
          _currentRadius = _minRadius
          _currentHeight = _height
        }

        positions = _getPositions(_center, _edge, _currentRadius, _currentHeight)
        return positions
      }, false),
      // set material
      material: new Cesium.WallDiffuseMaterialProperty({
        color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
      })
    }
  })
}

export function removeWall(viewer) {
  if (wall) {
    viewer.entities.remove(wall)
  }
}
