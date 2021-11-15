import Cesium from '@/cesiumUtils/cesium'
import { deepObjectMerge } from '.'

export default class DrawSatellite {
  /**
     *Creates an instance of DrawSatellite.
     * @param {*} viewer 需要传入
     * @param {*} options.lines  点集合 需要传入如 [104, 30, 100, 105, 30, 101]
     * @param {*} options.conf 线段的配置 见 defaultConf 不一定传入, 传入会合并
     * @memberof DrawSatellite
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.entity = undefined
    this.entity2 = undefined
    this.lines = options.lines
    this.InitLine()
    this.InitRadarArea()
  }

  // 路线
  InitLine() {
    const defaultConf = {
      id: 'satellite',
      name: 'wxgj',
      // 可见范围
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 1000),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.lines),
        width: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.WHITE
        })
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
  }

  /**
   *
   * 卫星下面的锥形
   * @param {*} position computeFlight计算的属性
   * @memberof Roaming
   */
  InitRadarArea() {
    const position = Cesium.Cartesian3.fromDegrees(...[89, 0, 350000])
    // x,y,z轴的倾斜角度
    const hpr = new Cesium.HeadingPitchRoll(0, 0.0, 0.0)
    // 确定目标x,y,z轴方向
    const op = Cesium.Cartesian3.fromDegrees(...[89, 0, 350000])
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(op, hpr)
    this.entity2 = this.viewer.entities.add({
      id: '233',
      name: '卫星探测区域',
      // 位置
      position,
      orientation,
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 700000,
        material: Cesium.Color.BLUE.withAlpha(0.1),
        outline: 1,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.1)
      }
    })
    // this.viewer.zoomTo(this.entity2)
  }

  // 删除整个连线
  removeLine() {
    this.viewer.entities.remove(this.entity)
    this.viewer.entities.remove(this.entity2)
  }
}
