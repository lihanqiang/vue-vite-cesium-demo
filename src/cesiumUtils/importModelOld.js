/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import Cesium from '@/cesiumUtils/cesium'
import { $t } from '@/cesiumUtils/i18n'
import { deepObjectMerge } from '.'

export default class ImportModel {
  /**
     *Creates an instance of ImportModel.
     * @param {*} viewer required
     * @param {*} options.uri model uri, required
     * @param {*} options.position [lon, lat, hei] of model, required
     * @param {*} options.conf configuration of model, see defaultConf, optional
     * @param {*} options.tarEntity tracing entity, optional
     * @memberof ImportModel
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.entity = undefined
    this.position = options.position
    this.conf = options.conf
    this.tarEntity = options.tarEntity
    // wave
    this.wave = undefined
    this.InitModel()
  }

  // generate entities
  InitModel() {
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...this.position)
    const heading = Cesium.Math.toRadians(135)
    const pitch = 0
    const roll = 0
    // set postion
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian3, hpr)
    const defaultConf = {
      id: `${Math.random()}`,
      name: '',
      label: {
        text: '',
        backgroundPadding: new Cesium.Cartesian2(7, 7),
        showBackground: true,
        pixelOffset: new Cesium.Cartesian2(0, -50),
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: '30px sans-serif',
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.4,
        fillColor: Cesium.Color.WHITE,
        scaleByDistance: new Cesium.NearFarScalar(10000000, 1, 10000001, 0.0)
      },
      // position
      position: cartesian3,
      // orientation
      orientation,
      // load model
      model: {
        // model uri
        uri: this.uri,
        // CLAMP_TO_GROUND
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // heightReference
        heightReference: Cesium.HeightReference.NONE,
        scale: 1,
        runAnimations: false // disable animations (default: true)
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
    // this.viewer.zoomTo(this.entity)
    // this.viewer.trackedEntity = this.entity
    const _this = this
    // realtime rendering function
    this.renderFunc = this.viewer.clock.onTick.addEventListener((result) => {
      if (_this && _this.entity) {
        const tarentity = _this.entity
        if (tarentity.id && tarentity.id === 'airPlane') {
          const curtime = _this.viewer.clock.currentTime
          const pos = tarentity.position.getValue(curtime, result)
          const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos)
          const lon = Cesium.Math.toDegrees(cartographic.longitude)
          const lat = Cesium.Math.toDegrees(cartographic.latitude)
          const { height } = cartographic
          const nowText = `${$t('plane longitude:')}${lon.toFixed(2)}° ${$t('latitude:')}${lat.toFixed(2)}° ${$t('height:')}${height.toFixed(2)}m, ${$t('speed:')}${tarentity.speed.toFixed(2)}m/s`
          // update async
          if (nowText !== tarentity.label.text) {
            tarentity.label.text = nowText
          }
        }
      }
    })
  }

  /**
   * @param {*} entities // connect other entities
   * obj, array
   * @memberof ImportModel
   */
  traceTarget(entities) {
    entities = Array.isArray(entities) ? entities : [entities]
    this.wave = this.viewer.entities.add({
      id: 'scanWave',
      name: $t('scanWave'),
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          // compute nearest route, connect nearest node
          const latestEntityPosition = this.getNearestEntityPosition(entities, time, lon1, lat1, height1)
          return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, ...latestEntityPosition], Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 5,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.YELLOW
        })
      }
    })
  }

  /**
   * @param {*} entities // connect other entities
   * @param {*} time
   * @param {*} lon1 // target's lon
   * @param {*} lat1 // target's lat
   * @param {*} height1 // target's height
   * @memberof ImportModel
   */
  getNearestEntityPosition(entities, time, lon1, lat1, height1) {
    const distanceObj = {}
    entities.forEach((item) => {
      const tarpos = item.position.getValue(time)
      const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos)
      const lon2 = Cesium.Math.toDegrees(cartographic.longitude)
      const lat2 = Cesium.Math.toDegrees(cartographic.latitude)
      const height2 = cartographic.height
      const distance = this.getLineDis([lon1, lat1, height1 <= 0 ? 0 : height1], [lon2, lat2, height2 <= 0 ? 0 : height2])
      distanceObj[distance] = [lon2, lat2, height2]
    })
    const minKey = Math.min(...Object.keys(distanceObj))
    return distanceObj[minKey]
  }

  /**
   * return distance of two points
   * @param {[]} startPosition // source's [lon, lat, hei]
   * @param {[]} endPosition // target's [lon, lat, hei]
   * @memberof ImportModel
   */
  getLineDis(startPosition, endPosition) {
    const geodesic = new Cesium.EllipsoidGeodesic()
    const startCartographic = Cesium.Cartographic.fromDegrees(...startPosition)
    const endCartographic = Cesium.Cartographic.fromDegrees(...endPosition)
    geodesic.setEndPoints(startCartographic, endCartographic)
    return geodesic.surfaceDistance
  }

  destroyWaveAndOnTickListener() {
    if (this.wave) {
      this.viewer.entities.remove(this.wave)
    }
    if (this.renderFunc) {
      this.renderFunc()
    }
  }
}
