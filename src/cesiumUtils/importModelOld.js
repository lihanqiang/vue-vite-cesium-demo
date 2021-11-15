/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import Cesium from '@/cesiumUtils/cesium'
import { deepObjectMerge } from '.'

export default class ImportModel {
  /**
     *Creates an instance of ImportModel.
     * @param {*} viewer 需要传入
     * @param {*} options.uri 模型的uri 需要传入
     * @param {*} options.position 模型的位置经纬度高度数组 需要传入
     * @param {*} options.conf 模型的配置 见defaultConf 不一定传入
     * @param {*} options.tarEntity 连线的实体entity, 若要连线需要传入
     * @memberof ImportModel
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.entity = undefined
    this.position = options.position
    this.conf = options.conf
    this.tarEntity = options.tarEntity
    // 波束
    this.wave = undefined
    this.InitModel()
  }

  // 生成实体
  InitModel() {
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...this.position)
    const heading = Cesium.Math.toRadians(135)
    const pitch = 0
    const roll = 0
    // 位置朝向
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
      // 位置
      position: cartesian3,
      // 计算朝向
      orientation,
      // 加载模型
      model: {
        // 模型路径
        uri: this.uri,
        // 模型贴地
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // 默认绝对高度
        heightReference: Cesium.HeightReference.NONE,
        scale: 1,
        runAnimations: false // 是否运行模型中的动画效果(默认true)
      }
    }
    this.entity = this.viewer.entities.add(deepObjectMerge(defaultConf, this.conf))
    // 设置相机视角默认在飞机上
    // this.viewer.zoomTo(this.entity)
    // this.viewer.trackedEntity = this.entity
    const _this = this
    // 实时渲染事件
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
          const nowText = `飞机 经度：${lon.toFixed(2)}° 纬度：${lat.toFixed(2)}° 高度：${height.toFixed(2)}m, 速度：${tarentity.speed.toFixed(2)}m/s`
          // 不同时更新
          if (nowText !== tarentity.label.text) {
            tarentity.label.text = nowText
          }
        }
      }
    })
  }

  /**
   * @param {*} entities // 连接其他实体entity obj, array
   * @memberof ImportModel
   */
  traceTarget(entities) {
    entities = Array.isArray(entities) ? entities : [entities]
    this.wave = this.viewer.entities.add({
      id: 'scanWave',
      name: '探测波束',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          // 获取最短的路径, 连接最近节点
          const latestEntityPosition = this.getLatestEntityPosition(entities, time, lon1, lat1, height1)
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
   * @param {*} entities // 连接其他实体entity obj, array
   * @param {*} time
   * @param {*} lon1 // 目标的经度
   * @param {*} lat1 // 目标的纬度
   * @param {*} height1 // 目标的高度
   * @memberof ImportModel
   */
  getLatestEntityPosition(entities, time, lon1, lat1, height1) {
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

  destroyWaveAndOnTickListener() {
    if (this.wave) {
      this.viewer.entities.remove(this.wave)
    }
    if (this.renderFunc) {
      this.renderFunc()
    }
  }
}
