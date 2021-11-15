import Cesium from '@/cesiumUtils/cesium'

export default class Roaming {
  /**
     *Creates an instance of satellite roaming.
     * @param {*} viewer 需要传入
     * @param {*} options.modeluri 模型的uri 需要传入
     * @param {*} options.start 开始节点 不需要传入
     * @param {*} options.stop  结束节点 不需要传入
     * @param {*} options.Lines  点集合 需要传入
     * @param {*} options.isPathShow 路径是否显示 默认显示
     * @memberof Roaming
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.entity = undefined
    this.entity2 = undefined
    this.url = options.uri
    this.start = undefined
    this.stop = undefined
    this.Lines = options.Lines
    const newLen = options.Lines.length / 3
    this.LinesArr = Array(newLen).fill('').map((any, i) => {
      return options.Lines.slice(i * 3, (i + 1) * 3)
    })
    this.isPathShow = options.isPathShow || true
    this.InitSatellite(this.computeFlight(this.LinesArr), this.start, this.stop)
    this.InitRadarArea(this.computeFlight(this.LinesArr, true), this.start, this.stop, true)
  }

  /**
     *
     *
     * @param {*} Lines 点集合
     * @param {*} isCone 是否是圆锥区域
     * @returns
     * @memberof Roaming
     */
  computeFlight(Lines, isCone) {
    const property = new Cesium.SampledPositionProperty()
    const start = Cesium.JulianDate.now()
    this.start = start
    const stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate())
    this.stop = stop
    this.viewer.clock.startTime = start.clone()
    this.viewer.clock.stopTime = stop.clone()
    this.viewer.clock.currentTime = start.clone()
    // 循环执行
    this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // Loop at the end
    // 时间速率，数字越大时间过的越快
    // this.viewer.clock.multiplier = 10

    this.viewer.timeline.zoomTo(start, stop)

    Lines.forEach((line, i) => {
      const time = Cesium.JulianDate.addSeconds(start, line[0], new Cesium.JulianDate())
      const position = Cesium.Cartesian3.fromDegrees(line[0], line[1], isCone ? line[2] / 2 : line[2])
      property.addSample(time, position)
    })
    return property
  }

  /**
     *
     * 画卫星和卫星的路径
     * @param {*} position computeFlight计算的属性
     * @param {*} start 开始时间节点
     * @param {*} stop 结束时间节点
     * @memberof Roaming
     */
  InitSatellite(position, start, stop) {
    this.entity = this.viewer.entities.add({
      id: 'satt',
      name: '卫星',
      label: {
        text: '卫星',
        backgroundPadding: new Cesium.Cartesian2(7, 7),
        showBackground: true,
        pixelOffset: new Cesium.Cartesian2(0, -100),
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: '30px sans-serif',
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.5,
        fillColor: Cesium.Color.WHITE,
        scaleByDistance: new Cesium.NearFarScalar(10000000, 1, 10000001, 0.0)
      },
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start,
        stop
      })]),
      // 位置
      position,
      // 计算朝向
      orientation: new Cesium.VelocityOrientationProperty(position),
      // 加载模型
      model: {
        // 模型路径
        uri: this.url,
        // 模型最小刻度
        minimumPixelSize: 20000,
        maximumSize: 20000,
        // 设置模型最大放大大小
        maximumScale: 200000,
        // scale: 20000,
        runAnimations: true // 是否运行模型中的动画效果
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.WHITE
        }),
        width: 2
      }
    })
    // 设置连线的曲度
    this.entity.position.setInterpolationOptions({
      // 曲度
      interpolationDegree: 3,
      // 点插值 (接近圆)
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      // 点插值 (直连)
      // interpolationAlgorithm: Cesium.LinearApproximation
      // // // 点插值 (接近半圆)
      // interpolationAlgorithm: Cesium.HermitePolynomialApproximation
    })
    // 设置相机视角默认在飞机上
    // this.viewer.zoomTo(this.entity)
    // this.viewer.trackedEntity = this.entity
  }

  /**
     *
     * 卫星下面的锥形
     * @param {*} position computeFlight计算的属性
     * @param {*} start 开始时间节点
     * @param {*} stop 结束时间节点
     * @memberof Roaming
     */
  InitRadarArea(position, start, stop) {
    this.entity2 = this.viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start,
        stop
      })]),
      name: '卫星探测区域',
      // 位置
      position,
      // 计算朝向
      orientation: new Cesium.VelocityOrientationProperty(position),
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 700000,
        material: Cesium.Color.BLUE.withAlpha(0.2),
        outline: 1,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.1)
      }
    })
    // 设置连线的曲度
    this.entity2.position.setInterpolationOptions({
      // 曲度
      interpolationDegree: 5,
      // 点插值 (接近圆)
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
    })
  }

  /**
   *漫游的暂停和继续
   *
   * @param {*} state bool类型 false为暂停，ture为继续
   * @memberof Roaming
   */
  PauseOrContinue(state) {
    this.viewer.clock.shouldAnimate = state
  }

  /**
   *改变飞行的速度
   *
   * @param {*} value  整数类型
   * @memberof Roaming
   */
  ChangeRoamingSpeed(value) {
    this.viewer.clock.multiplier = value
  }

  /**
   *
   *取消漫游
   * @memberof Roaming
   */
  EndRoaming() {
    if (this.entity) {
      this.viewer.entities.remove(this.entity)
    }
    if (this.entity2) {
      this.viewer.entities.remove(this.entity2)
    }
  }
}
