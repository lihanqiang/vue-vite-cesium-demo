/* eslint-disable no-underscore-dangle */
import Cesium from '../importCesium'

export default class ImportPlane {
  /**
     *Creates an instance of ImportPlane.
     * @param {*} viewer 需要传入
     * @param {*} options.uri 模型的uri 需要传入
     * @param {*} options.position 模型的位置经纬度高度数组 需要传入
     * @memberof ImportPlane
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.position = options.position
    this.cylinderPrimitive = null
    this.airplanePath = null
    this.InitPlane()
  }

  // 生成实体
  InitPlane() {
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...this.position)
    const heading = Cesium.Math.toRadians(135)
    const pitch = 0
    const roll = 0
    // 位置朝向
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian3, hpr)
    this.entity = this.viewer.entities.add({
      id: 'airPlane',
      name: '飞机',
      label: {
        text: '飞机',
        backgroundPadding: new Cesium.Cartesian2(7, 7),
        showBackground: true,
        pixelOffset: new Cesium.Cartesian2(0, -50),
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: '30px sans-serif',
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.4,
        fillColor: Cesium.Color.WHITE,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000, 500000)
      },
      // 位置
      position: cartesian3,
      // 计算朝向
      orientation,
      // 加载模型
      model: {
        // 模型路径
        uri: this.uri,
        // 默认绝对高度
        heightReference: Cesium.HeightReference.NONE,
        // 模型最小刻度
        minimumPixelSize: 128,
        maximumSize: 200,
        // 设置模型最大放大大小
        maximumScale: 200,
        scale: 1,
        runAnimations: true // 是否运行模型中的动画效果(默认true)
      },
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 70,
        topRadius: 0,
        bottomRadius: 700,
        material: Cesium.Color.BLUE.withAlpha(0.15),
        outline: 1,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.1)
      }
    })
    // 设置相机视角默认在飞机上
    // this.viewer.zoomTo(this.entity)
    // this.viewer.trackedEntity = this.entity
    const _this = this
    // 实时渲染事件
    // this.viewer.scene.postRender.addEventListener
    this.viewer.clock.onTick.addEventListener((result) => {
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
          if (_this.cylinderPrimitive) {
            const cart3 = Cesium.Cartesian3.fromDegrees(lon, lat, height / 2)
            const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cart3)
            _this.cylinderPrimitive.modelMatrix = modelMatrix
          }
        }
      }
    })
  }

  /**
   * 显示飞机的探测区域
   * @memberof ImportPlane
   */
  addCylinder() {
    const position = [...this.position]
    position[2] /= 2
    // 注意高度要减半
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...position)
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3)
    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.CylinderGeometry({
        length: 5000,
        topRadius: 0,
        bottomRadius: 2500,
        vertexFormat: Cesium.VertexFormat.DEFAULT
      }),
      id: 'searchArea',
      name: '相机探测区域',
      modelMatrix,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.BLUE.withAlpha(0.15)
        )
      }
    })
    this.cylinderPrimitive = this.viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: false
      })
    }))
  }

  /**
   * 显示飞机的航迹
   * @memberof ImportPlane
   */
  addPlanePath() {
    const _this = this
    const pathArr = [...this.position]
    const defaultConf = {
      id: 'airPlanePath',
      name: '飞机的航迹',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = _this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          pathArr.push(lon1, lat1, height1)
          // 回到起点
          if (pathArr.length > 50 && _this.getLineDis(_this.position, [lon1, lat1, height1]) < 1000) {
            _this.viewer.entities.remove(_this.airplanePath)
            _this.addPlanePath()
            return
          }
          // eslint-disable-next-line consistent-return
          return Cesium.Cartesian3.fromDegreesArrayHeights(pathArr, Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 0,
          color: Cesium.Color.BLUE
        })
      }
    }
    this.airplanePath = this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} targetPos // 连接其他model的位置的二维数组
   * @memberof ImportPlane
   */
  traceTarget(targetPos) {
    const defaultConf = {
      name: '连线',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          // 获取最短的路径, 连接最近节点
          const latestEntityPosition = this.getLatestEntityPosition(targetPos, lon1, lat1, height1)
          return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, ...latestEntityPosition], Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.RED
        })
      }
    }
    this.wave = this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} sat // 连接卫星entity
   * @memberof ImportPlane
   */
  traceSat(sat) {
    const defaultConf = {
      name: '卫星连线',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          const tarpos = sat.position.getValue(time)
          const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos)
          const lon2 = Cesium.Math.toDegrees(cartographic.longitude)
          const lat2 = Cesium.Math.toDegrees(cartographic.latitude)
          const height2 = cartographic.height
          return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.RED
        })
      }
    }
    this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} targetPos // 连接其他model的位置的二维数组
   * @param {*} lon1 // 目标的经度
   * @param {*} lat1 // 目标的纬度
   * @param {*} height1 // 目标的高度
   * @memberof ImportPlane
   */
  getLatestEntityPosition(poss, lon1, lat1, height1) {
    const distanceObj = {}
    poss.forEach((item) => {
      const lon2 = item[0]
      const lat2 = item[1]
      const height2 = item[2]
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
   * @memberof ImportPlane
   */
  // eslint-disable-next-line class-methods-use-this
  getLineDis(startPosition, endPosition) {
  // 使用cesium的对象中的方法获取距离数据，而不是根据坐标转换计算，
    const geodesic = new Cesium.EllipsoidGeodesic()
    const startCartographic = Cesium.Cartographic.fromDegrees(...startPosition)
    const endCartographic = Cesium.Cartographic.fromDegrees(...endPosition)
    geodesic.setEndPoints(startCartographic, endCartographic)
    return geodesic.surfaceDistance
  }
}
