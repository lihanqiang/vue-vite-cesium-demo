import Cesium from '@/cesiumUtils/cesium'
import { $t } from './i18n'

export default class Roaming {
  /**
     *Creates an instance of satellite roaming.
     * @param {*} viewer required
     * @param {*} options.modeluri model uri, required
     * @param {*} options.start start point
     * @param {*} options.stop  end point
     * @param {*} options.Lines  lines array, required
     * @param {*} options.isPathShow whether show path, default true
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
     * @param {*} Lines lines array
     * @param {*} isCone is cone
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
    this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // Loop at the end
    // multiplier much is faster
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
     * sat and sat route
     * @param {*} position computeFlight returned position
     * @param {*} start start time
     * @param {*} stop end time
     * @memberof Roaming
     */
  InitSatellite(position, start, stop) {
    this.entity = this.viewer.entities.add({
      id: 'satt',
      name: $t('satellite'),
      label: {
        text: $t('satellite'),
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
      // position
      position,
      // orientation
      orientation: new Cesium.VelocityOrientationProperty(position),
      // load model
      model: {
        // model uri
        uri: this.url,
        // minimumPixelSize
        minimumPixelSize: 20000,
        maximumSize: 20000,
        // maximumScale
        maximumScale: 200000,
        // scale: 20000,
        runAnimations: true // runAnimations
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
    // setInterpolationOptions
    this.entity.position.setInterpolationOptions({
      // interpolationDegree
      interpolationDegree: 3,
      // 点插值 (接近圆)
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      // 点插值 (直连)
      // interpolationAlgorithm: Cesium.LinearApproximation
      // // // 点插值 (接近半圆)
      // interpolationAlgorithm: Cesium.HermitePolynomialApproximation
    })
    // this.viewer.zoomTo(this.entity)
    // this.viewer.trackedEntity = this.entity
  }

  /**
     *
     * radar survey area
     * @param {*} position computeFlight returned position
     * @param {*} start start time
     * @param {*} stop end time
     * @memberof Roaming
     */
  InitRadarArea(position, start, stop) {
    this.entity2 = this.viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start,
        stop
      })]),
      name: $t('sat survey area'),
      // position
      position,
      // orientation
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
    this.entity2.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
    })
  }

  /**
   * roam pause and continue
   * @param {*} state boolean false pause, ture continue
   * @memberof Roaming
   */
  PauseOrContinue(state) {
    this.viewer.clock.shouldAnimate = state
  }

  /**
   * change roaming speed
   * @param {*} value  speed num (int)
   * @memberof Roaming
   */
  ChangeRoamingSpeed(value) {
    this.viewer.clock.multiplier = value
  }

  /**
   * cancel roaming
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
