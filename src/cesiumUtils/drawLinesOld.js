/* eslint-disable no-mixed-operators */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import Cesium from '@/cesiumUtils/cesium'
import { deepObjectMerge } from '.'

export default class DrawLines {
  /**
     *Creates an instance of DrawLines.
     * @param {*} viewer 需要传入
     * @param {*} options.lines  点集合 需要传入 [104, 30, 100, 105, 30, 101]
     * @param {*} options.model  指飞机(一般是)的entity, 默认没有
     * @param {*} options.showPoint  是否显示端点, 默认显示
     * @param {*} options.constantSpeed  是否匀速飞行, 默认是true
     * @param {*} options.pointConf 点的配置 见 defaultConf 不一定传入, 传入会合并
     * @param {*} options.conf 线段的配置 见 defaultConf 不一定传入, 传入会合并
     * @memberof DrawLines
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.showPoint = options.showPoint === undefined ? true : options.showPoint
    this.constantSpeed = options.constantSpeed === undefined ? true : options.constantSpeed
    this.pointEntity = undefined
    this.entity = undefined
    this.model = options.model
    this.lines = options.lines
    this.InitLine()
    // 最少36s
    if (this.model && this.lines) {
      this.modelMove(this.lines, 100)
    }
  }

  InitPoint(position) {
    const defaultConf = {
      id: `${Math.random()}`,
      name: '点',
      position: Cesium.Cartesian3.fromDegrees(...position),
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1
      }
    }
    this.pointEntity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.pointConf))
  }

  drawPoint() {
    const pointLen = this.lines.length
    for (let i = 0; i <= pointLen - 3; i += 3) {
      const arr = this.lines.slice(i, i + 3)
      this.InitPoint(arr)
    }
  }

  // 路线
  InitLine() {
    this.showPoint && this.drawPoint()
    const defaultConf = {
      id: `${Math.random()}`,
      name: '飞行路线',
      // 可见范围
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 1000),
      point: {
        pixelSize: 2,
        outlineWidth: 2,
        outlineColor: Cesium.Color.RED
      },
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.lines),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 2,
          color: Cesium.Color.GOLDENROD
        })
        // material: new Cesium.PolylineGlowMaterialProperty({
        //   color: Cesium.Color.BLUE
        // })
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
  }

  // 新增一个点并且自动连接最后一个线段点
  addPointAndDrawLine(position) {
    this.InitPoint(position)
    this.lines.push(...position)
    const _update = () => {
      return Cesium.Cartesian3.fromDegreesArrayHeights(this.lines)
    }
    this.entity.polyline.positions = new Cesium.CallbackProperty(_update, false)
  }

  // 删除整个连线
  removeLine() {
    this.viewer.entities.remove(this.entity)
  }

  /**
   *
   * 计算飞行路线
   * @param {*} lines 点集合
   * @param {*} seconds 飞行的时间秒数
   * @returns
   * @memberof Roaming
   */
  computeRoamingLineProperty(lines, seconds) {
    // seconds *= 10
    const property = new Cesium.SampledPositionProperty()
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, seconds, new Cesium.JulianDate())
    this.viewer.clock.startTime = start.clone()
    this.viewer.clock.stopTime = stop.clone()
    this.viewer.clock.currentTime = start.clone()
    // 循环执行
    this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // Loop at the end
    // this.viewer.timeline.zoomTo(start, stop)
    // 时间速率，数字越大时间过的越快
    this.viewer.clock.multiplier = 1
    this.model.availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start,
        stop
      })
    ])
    // 注意这个是[lon, lat, height, lon, lat, height, ...]的数组
    let singleTime = seconds
    const pointLen = lines.length
    let totalDis = 0
    const disArr = []
    // 获取所有路程
    for (let i = 0; i <= pointLen - 3; i += 3) {
      const nowPointPos = lines.slice(i, i + 3)
      const nextPointPos = lines.slice(i + 3, i + 6)
      if (nextPointPos && nextPointPos.length) {
        const dis = this.getLineDis(nowPointPos, nextPointPos)
        disArr.push(dis)
        totalDis += dis
      }
    }
    for (let i = 0; i <= pointLen - 3; i += 3) {
      const nowPointPos = lines.slice(i, i + 3)
      // 分为: 一段路径经历相同时间 constantTime 一段路径经历相同速度 constantSpeed
      // 若是匀速, 需要计算所有的位置点距离
      if (pointLen > 3) {
        if (this.constantSpeed) {
          const dis = disArr.slice(0, i / 3)
          const sum = this.getSum(dis)
          singleTime = sum / totalDis * seconds
          singleTime >= seconds ? singleTime = seconds : singleTime
          // 速度
          const eachDis = disArr[i / 3 - 1 < 0 ? 0 : i / 3 - 1]
          const eachTime = eachDis / totalDis * seconds
          this.model.speed = eachDis / eachTime
        } else {
          singleTime = i / 3 * (seconds / (pointLen / 3 - 1))
        }
        const time = Cesium.JulianDate.addSeconds(start, singleTime, new Cesium.JulianDate())
        const position = Cesium.Cartesian3.fromDegrees(...nowPointPos)
        property.addSample(time, position)
      }
    }
    return property
  }

  /**
   * 求和
   * @param numArr 数字数组
   */
  getSum(numArr) {
    let sum = 0
    numArr.forEach((num) => {
      sum += num
    })
    return sum
  }

  /**
   * 模型移动函数
   * @param lines 点集合
   * @param seconds 秒数
   */
  modelMove(...args) {
    const propertyPosition = this.computeRoamingLineProperty(...args)
    // 控制model的朝向
    this.model.orientation = new Cesium.VelocityOrientationProperty(propertyPosition)
    this.model.position = propertyPosition
  }

  /**
   * 返回距离单位米
   * @param {*} startPosition // 源点的经纬度高度数组
   * @param {*} endPosition // 终点的经纬度高度数组
   * @memberof ImportModel
   */
  getLineDis(startPosition, endPosition) {
    // 使用cesium的对象中的方法获取距离数据，而不是根据坐标转换计算，
    const geodesic = new Cesium.EllipsoidGeodesic()
    const startCartographic = Cesium.Cartographic.fromDegrees(...startPosition)
    const endCartographic = Cesium.Cartographic.fromDegrees(...endPosition)
    geodesic.setEndPoints(startCartographic, endCartographic)
    return geodesic.surfaceDistance
  }
}
