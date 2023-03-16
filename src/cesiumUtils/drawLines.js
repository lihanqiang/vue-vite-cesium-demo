/* eslint-disable no-mixed-operators */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import Cesium from '@/cesiumUtils/cesium'
import { deepObjectMerge } from '.'

export default class DrawLines {
  /**
     *Creates an instance of DrawLines.
     * @param {*} viewer required
     * @param {*} options.lines  points array default [104, 30, 100, 105, 30, 101]
     * @param {*} options.model  entity of plane(usually), default null
     * @param {*} options.showPoint  whether to display point, default true
     * @param {*} options.constantSpeed  whether to fly at a constant speed, default true
     * @param {*} options.pointConf conf of point
     * @param {*} options.conf conf of line
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
    this.lines = this.changeLine(this.lines)
    this.InitLine()
    // 36s minimum
    this.modelMove(this.lines, 60)
  }

  changeLine(point) {
    const line = []
    for (let i = 0; i < point.length; i++) {
      line.push(point[i][0], point[i][1], point[i][2])
    }
    return line
  }

  InitPoint(position) {
    const defaultConf = {
      id: `${Math.random()}`,
      name: 'PP',
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

  // Line
  InitLine() {
    const defaultConf = {
      id: `${Math.random()}`,
      name: 'FXLX',
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 1000),
      point: {
        pixelSize: 2,
        outlineWidth: 2,
        outlineColor: Cesium.Color.RED
      },
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.lines),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.GOLD
          // gapColor: Cesium.Color.GOLD
        })
        // material: new Cesium.PolylineGlowMaterialProperty({
        //   color: Cesium.Color.BLUE
        // })
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
  }

  addPointAndDrawLine(position) {
    this.InitPoint(position)
    this.lines.push(...position)
    const _update = () => {
      return Cesium.Cartesian3.fromDegreesArrayHeights(this.lines)
    }
    this.entity.polyline.positions = new Cesium.CallbackProperty(_update, false)
  }

  // remove line
  removeLine() {
    this.viewer.entities.remove(this.entity)
    this.entity = null
  }

  /**
   *
   * Calculate flight path
   * @param {*} lines Points set
   * @param {*} seconds Flight time (seconds)
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
    this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // Loop at the end
    // this.viewer.timeline.zoomTo(start, stop)
    this.viewer.clock.multiplier = 1
    this.model.availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start,
        stop
      })
    ])
    // pattern: [lon, lat, height, lon, lat, height, ...] is array
    let singleTime = seconds
    const pointLen = lines.length
    let totalDis = 0
    const disArr = []
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
      if (pointLen > 3) {
        if (this.constantSpeed) {
          const dis = disArr.slice(0, i / 3)
          const sum = this.getSum(dis)
          singleTime = sum / totalDis * seconds
          singleTime >= seconds ? singleTime = seconds : singleTime
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
   * getSum
   * @param numArr Numeric array
   */
  getSum(numArr) {
    let sum = 0
    numArr.forEach((num) => {
      sum += num
    })
    return sum
  }

  /**
   * Model movement function
   * @param lines points set
   * @param seconds seconds
   */
  modelMove(...args) {
    if (this.model && this.lines) {
      const propertyPosition = this.computeRoamingLineProperty(...args)
      this.model.orientation = new Cesium.VelocityOrientationProperty(propertyPosition)
      this.model.position = propertyPosition
    }
  }

  /**
   * Return distance in meters
   * @param {*} startPosition // Longitude and latitude height array of source point
   * @param {*} endPosition // Longitude and latitude height array of target point
   * @memberof ImportModel
   */
  getLineDis(startPosition, endPosition) {
    // Use the method in cesium's object to obtain distance data instead of calculating according to coordinate transformation
    const geodesic = new Cesium.EllipsoidGeodesic()
    const startCartographic = Cesium.Cartographic.fromDegrees(...startPosition)
    const endCartographic = Cesium.Cartographic.fromDegrees(...endPosition)
    geodesic.setEndPoints(startCartographic, endCartographic)
    return geodesic.surfaceDistance
  }
}
