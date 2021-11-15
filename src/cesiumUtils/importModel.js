import Cesium from '@/cesiumUtils/cesium'

export default class ImportModel {
  /**
     *Creates an instance of ImportModel.
     * @param {*} viewer 需要传入
     * @param {*} options.uri 模型的uri 需要传入
     * @param {*} options.position 模型的位置经纬度高度数组 需要传入
     * @param {*} options.conf 模型的配置 见defaultConf 不一定传入
     * @memberof ImportModel
     */
  constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.position = options.position
    this.conf = options.conf
    this.InitModel()
  }

  // 生成model
  InitModel() {
    const { viewer } = this
    const {
      id, name, text, scale = 1
    } = this.conf
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...this.position)
    const modelConf = {
      id,
      position: cartesian3,
      model: {
        uri: this.uri,
        scale
      },
      label: {
        position: cartesian3,
        backgroundPadding: new Cesium.Cartesian2(7, 7),
        showBackground: true,
        text,
        name,
        font: '30px sans-serif',
        scale: 0.4,
        fillColor: Cesium.Color.WHITE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(700000, 8000000),
        pixelOffset: new Cesium.Cartesian2(0, -50)
      }
    }
    if (id !== 'sat') {
      modelConf.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(1000, 500000)
    }
    const model = viewer.entities.add(modelConf)
    Cesium.when(model.readyPromise).then((thisModel) => {
      thisModel.activeAnimations.addAll({
        loop: Cesium.ModelAnimationLoop.REPEAT
      })
    })
  }

  /**
   * 计算某点的高程
   * @param {*} text // label的文字
   * @param {*} position // 出现的位置
   * @memberof ImportModel
   */
  computeHeight(lon = 103, lat = 33.8084) {
    const { viewer } = this
    const positions = Cesium.Cartographic.fromDegrees(lon, lat)
    // eslint-disable-next-line new-cap
    let promise = new Cesium.sampleTerrain(viewer.terrainProvider, 13, [positions])
    promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions)
    Cesium.when(promise, (updatedPositions) => {
    })
  }

  /**
   * 添加label
   * @param {*} text // label的文字
   * @param {*} position // 出现的位置
   * @memberof ImportModel
   */
  addPrimitiveLabel(text = '', position) {
    if (!text) {
      return
    }
    const labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection())
    labels.add({
      position: Cesium.Cartesian3.fromDegrees(...position),
      backgroundPadding: new Cesium.Cartesian2(7, 7),
      showBackground: true,
      text,
      font: '30px sans-serif',
      scale: 0.4,
      fillColor: Cesium.Color.WHITE,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000, 500000),
      eyeOffset: Cesium.Cartesian3(1000.0, 0.0, 0.0),
      pixelOffset: new Cesium.Cartesian2(0, -50)
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    })
  }

  /**
   * 添加各模型之间的连线
   * @param {*} targetPos // 线段终止点的位置
   * @memberof ImportModel
   */
  addPrimitiveLine(targetPos) {
    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([...this.position, ...targetPos]),
          width: 2
        })
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
          color: Cesium.Color.YELLOW, // 线条颜色
          gapColor: Cesium.Color.TRANSPARENT, // 间隔颜色
          dashLength: 5 // 短划线长度
        })
      })
    })
    this.viewer.scene.primitives.add(primitive)
  }
}
